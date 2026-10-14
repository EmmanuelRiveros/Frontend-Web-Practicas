import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import 'dotenv/config';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const host = 'http://localhost:3000';
const resultados = [];
let servidor;
let logs = '';
const wait = ms => new Promise(r => setTimeout(r, ms));
const ocultar = value => {
  if (Array.isArray(value)) return value.map(ocultar);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).map(([k,v]) => [k, k === 'access_token' ? '[JWT emitido y comprobado; oculto en evidencia]' : ocultar(v)]),
  );
  return value;
};

async function iniciar() {
  servidor = spawn(process.execPath, ['dist/src/main.js'], { stdio: ['ignore','pipe','pipe'] });
  servidor.stdout.on('data', b => { logs += b.toString(); });
  servidor.stderr.on('data', b => { logs += b.toString(); });
  for (let i=0; i<100; i++) {
    if (servidor.exitCode !== null) throw new Error('Servidor terminó: '+logs.slice(-2500));
    try { const r=await fetch(host+'/clases'); if(r.status===200) return; } catch {}
    await wait(200);
  }
  throw new Error('El servidor no inició.');
}

async function parar() {
  if (!servidor || servidor.exitCode !== null) return;
  const salida = new Promise(r => servidor.once('exit',r));
  servidor.kill();
  await salida;
}

async function caso(titulo, metodo, ruta, esperado, cuerpo, token, extra={}) {
  const headers = { ...extra };
  if (cuerpo !== undefined) headers['Content-Type']='application/json';
  if (token) headers.Authorization='Bearer '+token;
  const r=await fetch(host+ruta, { method:metodo, headers, body:cuerpo===undefined?undefined:JSON.stringify(cuerpo) });
  const tipo=r.headers.get('content-type') ?? '';
  const respuesta=tipo.includes('json')?await r.json():await r.text();
  assert.equal(r.status, esperado, titulo+' '+JSON.stringify(respuesta));
  assert.ok(r.headers.get('x-request-id'), titulo+' sin X-Request-Id');
  if (r.status<400 && tipo.includes('json')) {
    assert.ok('data' in respuesta && 'meta' in respuesta, titulo+' sin sobre');
    assert.equal(respuesta.meta.ruta,ruta);
    assert.equal(typeof respuesta.meta.duracionMs,'number');
  }
  if (r.status>=400) assert.ok(!('data' in respuesta), titulo+' error envuelto');
  const visibles={...headers};
  if(visibles.Authorization) visibles.Authorization='Bearer [JWT enviado y verificado]';
  const cuerpoVisible={...cuerpo};
  if(cuerpoVisible.password) cuerpoVisible.password='[contraseña de prueba enviada]';
  resultados.push({ titulo, metodo, url:host+ruta, solicitud:{headers:visibles,cuerpo:cuerpo===undefined?null:cuerpoVisible}, status:r.status, headers:Object.fromEntries(r.headers), respuesta:ocultar(respuesta) });
  console.log('OK',r.status,titulo);
  return respuesta;
}

async function login(correo,titulo) {
  const r=await caso(titulo,'POST','/auth/login',200,{correo,password:'gimnasio2026'});
  return r.data.access_token;
}

try {
  // No reutiliza un servidor ajeno: la prueba administra su propio proceso.
  try { await fetch(host+'/clases'); throw new Error('Puerto 3000 ocupado. Cierra el servidor antes de verificar.'); }
  catch(e) { if(!String(e).includes('fetch failed')) throw e; }
  await iniciar();
  const admin = await login('admin@itson.mx','Inicio de sesión administrador');
  let karla;
  let propia;
  const texto=await readFile('peticiones.http','utf8');
  const bloques=texto.split(/^### (?=\d+\.)/m).slice(1);
  assert.equal(bloques.length,44);
  for(const bloque of bloques) {
    const lineas=bloque.split(/\r?\n/);
    const titulo=lineas[0];
    const n=Number(titulo.match(/^\d+/)[0]);
    const pos=lineas.findIndex(l=>/^(GET|POST|PATCH|DELETE) /.test(l));
    const [metodo,url]=lineas[pos].split(' ');
    const ruta=url.replace('{{host}}','');
    const esperado=Number(titulo.match(/->\s*(\d+)/)?.[1] ?? (n===32?404:200));
    const headers={};
    for(const l of lineas.slice(pos+1)) {
      if(/^(Content-Type|Origin|X-Request-Id):/i.test(l)) {
        const sep=l.indexOf(':'); headers[l.slice(0,sep)]=l.slice(sep+1).trim();
      }
    }
    const inicio=lineas.findIndex((l,i)=>i>pos && l.trim().startsWith('{'));
    let cuerpo;
    if(inicio>=0) {
      const json=lineas.slice(inicio).join('\n').match(/^\{[\s\S]*?\}/)?.[0];
      assert.ok(json,'No se encontró cuerpo JSON');
      cuerpo=JSON.parse(json);
    }
    const token=bloque.includes('Bearer {{tokenKarla}}')?karla:
      bloque.includes('Bearer {{tokenAdmin}}')?admin:undefined;
    const r=await caso(titulo,metodo,ruta,esperado,cuerpo,token,headers);
    if(n===3 || n===32) {
      assert.equal(r.path,ruta); assert.ok(r.timestamp); assert.equal(r.error,n===3?'CupoLlenoError':'HorarioNoEncontradoError');
    }
    if(n===33) assert.equal(resultados.at(-1).headers['x-request-id'],'prueba-123');
    if(n===34) assert.equal(resultados.at(-1).headers['access-control-allow-origin'],'http://localhost:5173');
    if(n===35) assert.equal(resultados.at(-1).headers['access-control-allow-origin'],undefined);
    if(n===39) {
      karla=r.data.access_token;
      const decodificado = jwt.decode(karla,{complete:true});
      resultados.push({ titulo:'Claims del token de Karla decodificados localmente', respuesta:{ header:decodificado.header, payload:decodificado.payload, firma:'[verificada por el servidor; no publicada]' }, status:200, metodo:'DECODIFICAR', url:'Local sin enviar el secreto', headers:{} });
      assert.equal(jwt.decode(karla).miembroId,1);
      assert.ok(!('passwordHash' in jwt.decode(karla)));
    }
    if(n===41) propia=r.data.id;
    if(n===44) assert.equal(jwt.decode(r.data.access_token).miembroId,2);
  }
  await caso('Rol cancelación sin token','DELETE','/inscripciones/'+propia,401);
  await caso('Rol cancelación miembro','DELETE','/inscripciones/'+propia,403,undefined,karla);
  const entrenador=await login('ana@itson.mx','Inicio de sesión entrenador');
  await caso('Rol cancelación entrenador','DELETE','/inscripciones/'+propia,200,undefined,entrenador);
  const otra=await caso('Crear para probar administrador','POST','/inscripciones',201,{horarioId:2,miembroId:1},karla);
  await caso('Rol cancelación administrador','DELETE','/inscripciones/'+otra.data.id,200,undefined,admin);
  const partes=karla.split('.');
  const payload=JSON.parse(Buffer.from(partes[1],'base64url').toString());
  partes[1]=Buffer.from(JSON.stringify({...payload,rol:'admin'})).toString('base64url');
  await caso('Token con payload modificado','GET','/auth/yo',401,undefined,partes.join('.'));
  const vencido=jwt.sign({sub:1,correo:'karla@itson.mx',rol:'miembro',miembroId:1},process.env.JWT_SECRET,{expiresIn:-1});
  await caso('Token vencido','GET','/auth/yo',401,undefined,vencido);
  await caso('Token mal formado','GET','/auth/yo',401,undefined,'no-es-un-jwt');
  const desconocido=await caso('Correo inexistente','POST','/auth/login',401,{correo:'no-existe@itson.mx',password:'gimnasio2026'});
  assert.equal(desconocido.message,'Credenciales invalidas');
  await caso('Registro duplicado','POST','/auth/registro',409,{correo:'omar@itson.mx',password:'gimnasio2026'});
  await caso('Registro intenta autoconceder admin','POST','/auth/registro',400,{correo:'invasor@itson.mx',password:'gimnasio2026',rol:'admin'});
  await caso('Registro intenta tomar identidad ajena','POST','/auth/registro',400,{correo:'invasor@itson.mx',password:'gimnasio2026',miembroId:3});
  await caso('Registro persiste en MySQL','POST','/auth/registro',201,{correo:'persistencia@itson.mx',password:'gimnasio2026'});
  await parar();
  logs+='\n=== REINICIO DEL SERVIDOR SIN EJECUTAR SEED ===\n';
  await iniciar();
  await login('persistencia@itson.mx','Login de cuenta registrada después de reiniciar');
  const spec=await fetch(host+'/docs-json').then(r=>r.json());
  assert.equal(spec.components.securitySchemes.bearer.scheme,'bearer');
  assert.equal(spec.paths['/clases'].get.security.length,0);
  assert.ok(spec.components.schemas.RegistroDto.properties.correo);
  resultados.push({titulo:'OpenAPI generado con bearer y DTO',metodo:'GET',url:host+'/docs-json',status:200,headers:{},respuesta:{securitySchemes:spec.components.securitySchemes,registro:spec.components.schemas.RegistroDto,seguridadPublica:spec.paths['/clases'].get.security}});
  await mkdir('evidencias',{recursive:true});
  await writeFile('evidencias/resultados.json',JSON.stringify({total:resultados.length,fecha:new Date().toISOString(),resultados},null,2));
  await writeFile('evidencias/servidor.log',logs.replace(/\x1b\[[0-9;]*m/g,''));
  console.log('VERIFICADOS',resultados.length,'casos; el proceso se cerrará.');
} finally {
  await parar();
}
