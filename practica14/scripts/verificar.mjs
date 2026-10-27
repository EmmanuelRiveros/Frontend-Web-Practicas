import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const backend=process.env.BACKEND_DIR ? path.resolve(process.env.BACKEND_DIR) : path.resolve(raiz,'../../tienda-backend');
const evidencias=path.join(raiz,'evidencias');await mkdir(evidencias,{recursive:true});
const config=await readFile(path.join(backend,'.env'),'utf8');
assert.match(config,/\/tienda_practica14["\r\n]/,'La verificación solo admite la base de demostración tienda_practica14.');
const casos=[];const peticiones=[];const errores=[];let api,web,browser;
const prueba=(caso,condicion)=>{assert.ok(condicion,caso);casos.push({caso,correcto:true});};
const pausa=ms=>new Promise(r=>setTimeout(r,ms));
async function esperar(url){for(let i=0;i<100;i++){try{const r=await fetch(url);if(r.ok)return;}catch{}await pausa(150);}throw new Error('No inició '+url);}
async function parar(child){if(!child||child.exitCode!==null)return;const salida=once(child,'exit');child.kill();await salida;}
async function sembrar(){const p=spawn(process.execPath,[path.join(backend,'node_modules/prisma/build/index.js'),'db','seed'],{cwd:backend,stdio:'pipe',windowsHide:true});let salida='';p.stdout.on('data',d=>salida+=d);p.stderr.on('data',d=>salida+=d);const [codigo]=await once(p,'exit');assert.equal(codigo,0,salida);}
async function iniciarApi(){api=spawn(process.execPath,['dist/main.js'],{cwd:backend,stdio:'pipe',windowsHide:true,env:{...process.env,PORT:'3001'}});api.stdout.on('data',()=>{});api.stderr.on('data',()=>{});await esperar('http://localhost:3001/productos');}
try {
 await sembrar();await iniciarApi();
 web=spawn(process.execPath,[path.join(raiz,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','5173','--strictPort'],{cwd:raiz,stdio:'pipe',windowsHide:true});web.stdout.on('data',()=>{});web.stderr.on('data',()=>{});await esperar('http://localhost:5173');
 const sobre=await(await fetch('http://localhost:3001/productos')).json();prueba('Seeder: doce productos reales y sobre data meta',sobre.data.length===12&&sobre.meta.ruta==='/productos');
 browser=await chromium.launch({channel:process.platform==='win32'?'chrome':undefined,headless:true,args:['--remote-debugging-port=9333','--remote-allow-origins=*']});
 const context=await browser.newContext({viewport:{width:1366,height:900},recordHar:{path:path.join(evidencias,'red.har'),content:'omit',mode:'minimal'}});
 const page=await context.newPage();const mapa=new Map();
 page.on('request',r=>{if(r.url().startsWith('http://localhost:3001/')){const dato={metodo:r.method(),url:r.url(),estado:null};if(r.postData())dato.cuerpo=JSON.parse(r.postData());peticiones.push(dato);mapa.set(r,dato);}});
 page.on('response',r=>{const dato=mapa.get(r.request());if(dato)dato.estado=r.status();});
 page.on('requestfailed',r=>{const dato=mapa.get(r);if(dato)dato.fallo=r.failure()?.errorText;});
 page.on('pageerror',e=>errores.push(e.message));
 await page.goto('about:blank');
 const target=(await(await fetch('http://127.0.0.1:9333/json/list')).json()).find(t=>t.type==='page'&&t.url==='about:blank');
 const devtools=await context.newPage();await devtools.setViewportSize({width:1100,height:740});
 await devtools.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9333/devtools/page/'+target.id+'&panel=network');
 await devtools.getByRole('button',{name:'Toggle screencast',exact:true}).click();
 for(let i=0;i<3;i++)await devtools.keyboard.press('Control+=');
 const aviso=devtools.getByRole('button',{name:"Don't show again",exact:true});if(await aviso.count())await aviso.click();
 await devtools.getByText('Fetch/XHR',{exact:true}).click();
 async function captura(nombre,fullPage=false){await page.screenshot({path:path.join(evidencias,nombre),fullPage});}
 async function red(nombre){await pausa(200);await devtools.screenshot({path:path.join(evidencias,nombre)});}
 async function limpiarRed(){await devtools.getByRole('button',{name:/^Clear network log/}).click();}
 const tarjetas=page.locator('.tarjeta');const tarjeta=nombre=>tarjetas.filter({has:page.getByRole('heading',{name:nombre,exact:true})});
 const pagar=page.getByRole('button',{name:'Pagar pedido simulado',exact:true});
 const correo=page.getByLabel('Correo',{exact:true}),telefono=page.getByLabel('Teléfono',{exact:true});
 // Solo se retrasa la salida; la respuesta proviene del backend real.
 await page.route('http://localhost:3001/productos',async route=>{await pausa(600);await route.continue();});
 await page.goto('http://localhost:5173');await page.getByText('Cargando productos…',{exact:true}).waitFor();await captura('01-cargando.png');
 await tarjetas.nth(11).waitFor();await page.unroute('http://localhost:3001/productos');
 prueba('Catálogo de doce tarjetas desde la API',await tarjetas.count()===12);
 prueba('StrictMode produce dos GET iniciales',peticiones.filter(p=>p.metodo==='GET'&&p.url.endsWith('/productos')).length===2);
 prueba('Ambas peticiones iniciales recibieron 200',peticiones.filter(p=>p.url.endsWith('/productos')).every(p=>p.estado===200));
 await red('02-red-strictmode.png');await captura('03-catalogo.png',true);
 prueba('Dos productos agotados deshabilitados',await page.locator('.tarjeta__boton:disabled').count()===2);
 prueba('Imágenes locales cargadas',await page.locator('.tarjeta__imagen').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
 const conteoPeticiones=peticiones.length;
 await page.getByRole('button',{name:'calzado',exact:true}).click();prueba('Filtro calzado conserva cuatro productos',await tarjetas.count()===4);
 await page.getByRole('button',{name:'ropa',exact:true}).click();prueba('Filtro ropa conserva siete productos',await tarjetas.count()===7);
 await page.getByRole('button',{name:'accesorios',exact:true}).click();prueba('Filtro accesorios conserva un producto',await tarjetas.count()===1);
 prueba('Filtrar no repite la consulta a la API',peticiones.length===conteoPeticiones);
 await page.getByRole('button',{name:'todas',exact:true}).click();await tarjeta('Playera deportiva seca').getByRole('button').click();
 prueba('Carrito suma una pieza y precio',await page.locator('.pie').innerText().then(t=>t.includes('1 pieza')&&t.includes('399.00')));
 await page.getByRole('link',{name:'Ir al pago simulado'}).click();
 const pedidosAntes=peticiones.filter(p=>p.metodo==='POST').length;
 await correo.fill('sin-arroba');await telefono.fill('6440000000');await pagar.click();
 prueba('Correo sin arroba rechazado antes de enviar',await page.getByRole('alert').innerText().then(t=>t.includes('@')));
 await correo.fill('cliente@example.test');await telefono.fill('12345');await pagar.click();
 prueba('Teléfono incompleto rechazado antes de enviar',await page.getByRole('alert').innerText().then(t=>t.includes('10 dígitos')));
 prueba('Entradas inválidas no generan POST',peticiones.filter(p=>p.metodo==='POST').length===pedidosAntes);
 await captura('04-validacion.png');
 await correo.fill('a@b');await telefono.fill('6440000000');
 const invalida=page.waitForResponse(r=>r.url().endsWith('/pedidos')&&r.status()===400);await pagar.click();await invalida;
 await page.getByRole('alert').filter({hasText:'El correo no es válido'}).waitFor();
 prueba('El formulario también muestra la validación HTTP 400 del backend',await page.getByRole('alert').innerText()==='El correo no es válido');
 await correo.fill('cliente@example.test');await limpiarRed();
 await page.route('http://localhost:3001/pedidos',async route=>{await pausa(500);await route.continue();});
 const respuestaPedido=page.waitForResponse(r=>r.url().endsWith('/pedidos')&&r.request().method()==='POST');
 await pagar.click();const botonEnviando=page.getByRole('button',{name:'Enviando pedido…',exact:true});await botonEnviando.waitFor();
 prueba('El botón se deshabilita mientras se envía el pago',await botonEnviando.isDisabled());
 prueba('Los campos se bloquean durante el envío',await correo.isDisabled()&&await telefono.isDisabled());
 prueba('El catálogo no cambia el carrito durante el pago',await page.locator('[inert]').count()===1);
 const respuesta=await respuestaPedido;await page.unroute('http://localhost:3001/pedidos');const confirmado=(await respuesta.json()).data;
 prueba('Pedido real confirmado HTTP 201',respuesta.status()===201);
 prueba('Folio y total devueltos por la API',/^PED-\d+$/.test(confirmado.folio)&&confirmado.total===399);
 await page.getByText(new RegExp('Pedido confirmado. Folio: '+confirmado.folio)).waitFor();await tarjetas.nth(11).waitFor();
 prueba('Carrito vacío tras el pago',await page.locator('.pie').innerText().then(t=>t.includes('vacío')&&t.includes('0.00')));
 prueba('Existencia visible actualizada de tres a dos',await tarjeta('Playera deportiva seca').locator('.tarjeta__existencia').innerText()==='2 disponibles');
 prueba('Correo y teléfono se reinician al confirmar',await correo.inputValue()===''&&await telefono.inputValue()==='');
 prueba('El formulario evita navegar al pagar',page.url().startsWith('http://localhost:5173/')&&!page.url().includes('correo='));
 const post=peticiones.filter(p=>p.metodo==='POST').at(-1);prueba('Contrato del pedido contiene los IDs del carrito',JSON.stringify(post.cuerpo.productos)==='["P-005"]');
 await writeFile(path.join(evidencias,'pedido-confirmado.json'),JSON.stringify({estado:respuesta.status(),respuesta:await respuesta.json()},null,2));
 await red('05-red-pedido.png');await page.evaluate(()=>window.scrollTo(0,0));await captura('06-pedido-confirmado.png');
 await tarjeta('Playera deportiva seca').scrollIntoViewIfNeeded();await captura('07-existencia-actualizada.png');
 // Se conserva el carrito y el formulario si el servidor rechaza el inventario.
 for(let i=0;i<9;i++)await tarjeta('Tenis para correr Vento').getByRole('button').click();
 await page.getByRole('link',{name:'Ir al pago simulado'}).click();await correo.fill('cliente@example.test');await telefono.fill('6440000000');await limpiarRed();
 const rechazo=page.waitForResponse(r=>r.url().endsWith('/pedidos')&&r.status()===409);await pagar.click();const error409=await rechazo;
 await page.getByRole('alert').filter({hasText:'No hay suficientes piezas'}).waitFor();
 prueba('HTTP 409 muestra el mensaje literal de la API',await page.getByRole('alert').innerText()===(await error409.json()).message);
 prueba('El rechazo conserva las nueve piezas',await page.locator('.pie').innerText().then(t=>t.includes('9 pieza')));
 prueba('El rechazo conserva los campos controlados',await correo.inputValue()==='cliente@example.test'&&await telefono.inputValue()==='6440000000');
 const stock=await(await fetch('http://localhost:3001/productos/P-001')).json();prueba('409 no modifica la existencia real',stock.data.existencia===8);
 await captura('08-error-409.png');await red('09-red-409.png');
 await writeFile(path.join(evidencias,'rechazo-409.json'),JSON.stringify({estado:409,respuesta:await error409.json(),existenciaConservada:stock.data.existencia},null,2));
 // API realmente apagada, sin simular una respuesta de error.
 await parar(api);api=undefined;await limpiarRed();await page.goto('http://localhost:5173');await page.getByRole('button',{name:'Reintentar',exact:true}).waitFor();
 prueba('API apagada muestra error y reintento',await page.getByRole('alert').innerText().then(t=>t.includes('No se pudo conectar')));
 await captura('10-api-apagada.png');await red('11-red-api-apagada.png');
 await iniciarApi();const antesReintentar=peticiones.length;await page.getByRole('button',{name:'Reintentar',exact:true}).click();await tarjetas.nth(11).waitFor();
 prueba('Reintento recupera el catálogo con una nueva petición',peticiones.length===antesReintentar+1&&await tarjetas.count()===12);
 await captura('12-reintento-correcto.png');await red('13-red-reintento.png');
 // Laboratorio independiente: efecto incorrecto con consultas reales repetidas.
 await limpiarRed();const antesBucle=peticiones.length;await page.goto('http://localhost:5173/experimentos/index.html');
 for(let i=0;i<50&&peticiones.length-antesBucle<6;i++)await pausa(100);
 prueba('Sin arreglo de dependencias se repite GET tras cada render',peticiones.length-antesBucle>=6);
 await red('14-red-sin-dependencias.png');await captura('15-sin-dependencias.png');
 await page.goto('http://localhost:5173/experimentos/index.html?caso=formulario');await correo.fill('ejemplo@example.test');await telefono.fill('6440000000');
 await Promise.all([page.waitForURL(/correo=ejemplo/),page.getByRole('button',{name:'Enviar sin preventDefault'}).click()]);
 prueba('Sin preventDefault el navegador navega con los campos en la URL',page.url().includes('correo=ejemplo')&&page.url().includes('telefono=6440000000'));
 prueba('La navegación del formulario reinicia el estado',await correo.inputValue()===''&&await telefono.inputValue()==='');await captura('16-sin-preventdefault.png');
 await page.goto('http://localhost:5173');await tarjetas.nth(11).waitFor();await page.setViewportSize({width:390,height:844});
 prueba('Vista móvil sin desbordamiento horizontal',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await captura('17-movil.png');
 prueba('Sin excepciones JavaScript en la aplicación',errores.length===0);
 await context.close();
 await writeFile(path.join(evidencias,'resultados.json'),JSON.stringify({casos,folio:confirmado.folio,total:confirmado.total,peticiones,errores,nota:'Respuestas de NestJS y MySQL reales; los datos de contacto son ficticios. Las capturas de Red son del frontend auténtico de Chrome DevTools.'},null,2));
 console.log(`${casos.length} comprobaciones aprobadas. Folio real ${confirmado.folio}. Capturas, HAR y respuestas guardadas.`);
} finally {if(browser)await browser.close();await parar(web);await parar(api);}
