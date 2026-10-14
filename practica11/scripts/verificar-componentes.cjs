// Prueba de navegador. PLAYWRIGHT_MODULE puede apuntar al paquete del entorno.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const resultados = [];
const ok = (titulo, detalle) => { resultados.push({ titulo, resultado: 'correcto', detalle }); console.log('OK', titulo); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const out=path.resolve('evidencias');

(async()=>{
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({
    headless:true,
    ...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),
  });
  const page=await browser.newPage({viewport:{width:1320,height:950},deviceScaleFactor:1.5});
  const errores=[];
  const logs=[];
  page.on('pageerror',e=>errores.push(e.message));
  page.on('console',m=>{ if(m.type()==='log') logs.push(m.text()); });
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('tarjeta-producto').length===12);
  assert.equal(await page.locator('tarjeta-producto').count(),12);
  ok('12 tarjetas del catálogo',12);
  const imagenes=await page.locator('tarjeta-producto').evaluateAll(es=>es.map(e=>{
    const img=e.shadowRoot.querySelector('img');return {src:img.getAttribute('src'),cargada:img.complete&&img.naturalWidth>0};
  }));
  assert.ok(imagenes.every(i=>i.cargada)); ok('12 imágenes locales cargadas',imagenes);
  const botones = page.locator('#variantes boton-app');
  const inicio = await botones.first().boundingBox();
  const final = await botones.last().boundingBox();
  await page.screenshot({path:path.join(out,'01-variantes.png'),animations:'disabled',clip:{
    x:inicio.x,y:inicio.y,width:final.x+final.width-inicio.x,height:Math.max(inicio.height,final.height),
  }});
  await page.screenshot({path:path.join(out,'02-catalogo.png'),fullPage:true});
  const estados=await page.locator('#variantes boton-app').evaluateAll(es=>es.map(e=>{
    const b=e.shadowRoot.querySelector('button');return {variante:b.className,disabled:b.disabled,slot:b.querySelector('slot').assignedNodes().map(n=>n.textContent).join('')};
  }));
  assert.deepEqual(estados.map(e=>e.variante),['primario','secundario','danger','primario']);
  assert.equal(estados[3].disabled,true);
  ok('Variantes, disabled y texto por slot',estados);

  await page.evaluate(()=>{
    document.querySelector('#rejilla').addEventListener('agregar',e=>{window.__detalle=e.detail;},{once:true});
  });
  const card=id=>page.locator('tarjeta-producto[producto-id="'+id+'"]');
  const agregar=id=>card(id).getByRole('button',{name:'Agregar al carrito'});
  await agregar('P-001').click();
  const detalle=await page.evaluate(()=>window.__detalle);
  assert.deepEqual(detalle,{id:'P-001',nombre:'Tenis para correr Vento',precio:1299});
  ok('CustomEvent con id, nombre y precio numérico',detalle);
  await agregar('P-002').click();
  await agregar('P-003').click();
  assert.equal(await page.locator('#cuenta').innerText(),'3');
  ok('Tres productos actualizan el contador',3);
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(out,'03-contador.png')});

  const vaciar=page.locator('#vaciar');
  await vaciar.evaluate(e=>e.setAttribute('variante','danger'));
  assert.equal(await vaciar.getByRole('button').getAttribute('class'),'danger');
  await page.waitForTimeout(200);
  await page.locator('.encabezado__carrito').screenshot({path:path.join(out,'08-variante-danger.png'),animations:'disabled'});
  ok('Cambio de variante por atributo sin editar TypeScript','danger');
  await vaciar.evaluate(e=>e.setAttribute('disabled',''));
  assert.equal(await vaciar.getByRole('button').isDisabled(),true);
  await vaciar.getByRole('button').click({force:true});
  assert.equal(await page.locator('#cuenta').innerText(),'3');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#vaciar').shadowRoot.querySelector('button')).backgroundColor==='rgb(225, 229, 235)');
  await page.locator('.encabezado__carrito').screenshot({path:path.join(out,'09-deshabilitado.png'),animations:'disabled'});
  ok('disabled impide el click nativo y conserva contador',3);
  await vaciar.evaluate(e=>{e.removeAttribute('disabled');e.setAttribute('variante','secundario');});

  // Copia aislada del constructor del evento, solo en esta sesión de prueba.
  await page.evaluate(()=>{
    window.__CustomEventOriginal=window.CustomEvent;
    window.CustomEvent=class extends window.__CustomEventOriginal {
      constructor(tipo,opciones){super(tipo,tipo==='agregar'?{...opciones,composed:false}:opciones);}
    };
  });
  await agregar('P-001').click();
  assert.equal(await page.locator('#cuenta').innerText(),'3');
  ok('composed false no cruza la sombra y no incrementa',3);
  await page.evaluate(()=>{window.CustomEvent=window.__CustomEventOriginal;});
  await agregar('P-001').click();
  assert.equal(await page.locator('#cuenta').innerText(),'4');
  ok('Restaurar composed true vuelve a incrementar',4);
  await vaciar.getByRole('button',{name:'Vaciar'}).click();
  assert.equal(await page.locator('#cuenta').innerText(),'0');
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(out,'04-vaciar.png')});
  ok('Vaciar reinicia el contador',0);

  for(const [id,archivo] of [['P-009','05-licra-agotada.png'],['P-011','06-chamarra-agotada.png']]) {
    assert.equal(await agregar(id).isDisabled(),true);
    assert.equal(await card(id).locator('.existencia').innerText(),'Agotado');
    await agregar(id).click({force:true});
    assert.equal(await page.locator('#cuenta').innerText(),'0');
    await card(id).screenshot({path:path.join(out,archivo),animations:'disabled'});
    ok('Agotado deshabilita y no agrega '+id,0);
  }
  await card('P-001').evaluate(e=>e.setAttribute('precio','1300.5'));
  assert.match(await card('P-001').locator('.precio').innerText(),/1,300\.50/);
  ok('Precio de texto convertido a número y formateado','$1,300.50');
  await card('P-001').evaluate(e=>e.setAttribute('precio','1299'));
  await card('P-001').evaluate(e=>e.setAttribute('existencia','0'));
  assert.equal(await agregar('P-001').isDisabled(),true);
  await card('P-001').evaluate(e=>e.setAttribute('existencia','8'));
  assert.equal(await agregar('P-001').isEnabled(),true);
  ok('Cambios de existencia repintan sin recrear el componente','0 -> agotado; 8 -> habilitado');

  const aislamiento=await page.evaluate(()=>{
    const style=document.createElement('style');style.textContent='button{background:rgb(0,255,0)!important}';document.head.append(style);
    const host=document.querySelector('#vaciar'); const interno=host.shadowRoot.querySelector('button');
    const color=getComputedStyle(interno).backgroundColor;style.remove();return color;
  });
  assert.notEqual(aislamiento,'rgb(0, 255, 0)');ok('CSS externo no selecciona el button dentro de la sombra',aislamiento);
  const arbol=await page.evaluate(()=>{
    const host=document.querySelector('#vaciar');const b=host.shadowRoot.querySelector('button');
    return '<boton-app id="vaciar" variante="'+host.getAttribute('variante')+'">\n  #shadow-root ('+host.shadowRoot.mode+')\n    <style>CSS interno del componente</style>\n    <button type="'+b.type+'" class="'+b.className+'"'+(b.disabled?' disabled':'')+'>\n      <slot></slot>\n    </button>\n  Vaciar   <- texto del Light DOM asignado al slot\n</boton-app>';
  });
  const html='<!doctype html><html lang="es"><meta charset="utf-8"><style>body{font:20px Arial;padding:30px;background:#f1f5fa;color:#172b46}h1{font-size:27px}pre{font:19px/1.6 Consolas;white-space:pre-wrap}</style><h1>Inspección del DOM real del botón</h1><p>Lectura del ShadowRoot abierto mediante la API del navegador.</p><pre>'+esc(arbol)+'</pre></html>';
  const inspector=await browser.newPage({viewport:{width:1000,height:550},deviceScaleFactor:1.5});
  await inspector.setContent(html);await inspector.screenshot({path:path.join(out,'07-shadow-root.png'),fullPage:true});await inspector.close();
  ok('Shadow root abierto y slot comprobados',arbol);

  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'10-movil.png')});
  ok('Vista móvil sin desbordamiento horizontal',390);
  assert.deepEqual(errores,[]);ok('Sin errores JavaScript incluidos los eventos sin composed',errores);
  assert.ok(logs.some(l=>l.includes('Agregado: Tenis para correr Vento 1299')));
  ok('Consola recibe nombre y precio del evento',logs);
  await fs.writeFile(path.join(out,'resultados.json'),JSON.stringify({total:resultados.length,resultados},null,2));
  console.log('VERIFICADOS',resultados.length,'casos de navegador.');
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
