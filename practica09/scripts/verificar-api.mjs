import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = process.env.API_URL ?? 'http://localhost:3000';
const archivo = await readFile(path.join(root, 'peticiones.http'), 'utf8');
const bloques = archivo.split(/^### (?=\d+\.)/m);
const resultados = [];
for (const bloque of bloques) {
  const cabecera = bloque.split(/\r?\n/)[0];
  if (!/^\d+\./.test(cabecera)) continue;
  const match = bloque.match(/^(GET|POST|PATCH|DELETE|OPTIONS)\s+\{\{host\}\}(\S+)/m);
  if (!match) continue;
  const esperado = Number(cabecera.match(/(?:->|→)\s*(\d{3})/)?.[1] ?? 200);
  const cuerpo = bloque.match(/^\{[^\n]+\}/m)?.[0];
  const origen = bloque.match(/^Origin:\s*(.+)/m)?.[1]?.trim();
  const headers = {};
  if (cuerpo) headers['Content-Type'] = 'application/json';
  if (origen) headers.Origin = origen;
  const res = await fetch(host + match[2], { method: match[1], headers, body: cuerpo });
  const texto = await res.text();
  let datos;
  try { datos = JSON.parse(texto); } catch { datos = texto; }
  const actual = {
    numero: Number(cabecera.match(/^\d+/)[0]), titulo: cabecera,
    peticion: { metodo: match[1], ruta: match[2], origen: origen ?? null, cuerpo: cuerpo ? JSON.parse(cuerpo) : null },
    respuesta: { estado: res.status, cabeceras: Object.fromEntries(res.headers), cuerpo: datos },
    esperado,
  };
  resultados.push(actual);
  console.log(actual.numero, res.status, match[1], match[2]);
  assert.equal(res.status, esperado, cabecera + ': ' + texto);
  assert.ok(res.headers.get('x-request-id'), 'Cada respuesta incluye identificador');
  if (actual.numero === 1) assert.equal(res.headers.get('location'), '/inscripciones/1');
  if ([3,4,5,6,32].includes(actual.numero)) {
    assert.equal(datos.path, match[2]);
    assert.ok(!Number.isNaN(Date.parse(datos.timestamp)));
  }
  if ([33,34,35].includes(actual.numero)) {
    assert.ok(Array.isArray(datos.message), 'Validación contiene lista de detalles');
  }
  if ([36,38].includes(actual.numero)) {
    assert.equal(res.headers.get('access-control-allow-origin'), origen);
    assert.ok(res.headers.get('access-control-expose-headers')?.includes('X-Request-Id'));
    assert.ok(res.headers.get('access-control-expose-headers')?.includes('Location'));
  }
  if (actual.numero === 37) assert.equal(res.headers.get('access-control-allow-origin'), null);
  if (actual.numero === 39) assert.equal(datos.estado, 'cancelada');
  if (actual.numero === 40) assert.equal(datos.estado, 'confirmada');
}
assert.equal(resultados.length, 40, 'Se deben ejecutar los 40 bloques numerados');
await mkdir(path.join(root, 'capturas'), { recursive: true });
await writeFile(path.join(root, 'capturas', 'respuestas.json'), JSON.stringify({ fecha: new Date().toISOString(), host, resultados }, null, 2));
const escape = (v) => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const tarjetas = resultados.map(r => {
  const headers = Object.entries(r.respuesta.cabeceras).filter(([k]) => ['access-control-allow-origin','access-control-expose-headers','vary','location','x-request-id','content-type'].includes(k));
  return '<article data-numero="' + r.numero + '"><h2>' + escape(r.titulo) + '</h2>' +
    '<div class="request"><b>' + r.peticion.metodo + ' ' + escape(host + r.peticion.ruta) + '</b>' +
    (r.peticion.origen ? '<p>Origin: ' + escape(r.peticion.origen) + '</p>' : '') +
    (r.peticion.cuerpo ? '<pre>' + escape(JSON.stringify(r.peticion.cuerpo, null, 2)) + '</pre>' : '') + '</div>' +
    '<div class="response"><h3>HTTP ' + r.respuesta.estado + '</h3><pre>' + escape(headers.map(([k,v]) => k + ': ' + v).join('\n')) +
    '</pre><pre>' + escape(JSON.stringify(r.respuesta.cuerpo, null, 2)) + '</pre></div></article>';
}).join('');
const html = '<!doctype html><html lang="es"><meta charset="utf-8"><title>Práctica 9 Respuestas HTTP reales</title><style>' +
  '*{box-sizing:border-box}body{font:17px Arial,sans-serif;background:#f1f5f7;color:#182a38;margin:0;padding:28px}main{max-width:1100px;margin:auto}h1{font-size:26px;margin:0 0 8px}h2{font-size:20px;margin:0 0 16px}h3{color:#9a3825;font-size:21px;margin:0 0 14px}article{background:white;border:1px solid #bdcdd5;border-radius:8px;padding:22px;margin:22px 0;break-inside:avoid}.request{background:#edf3f6;padding:18px}.response{padding:18px 0 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:15px/1.4 Consolas,monospace;margin:12px 0}p{margin:10px 0;color:#40586a}</style><main><h1>Práctica 9 Pruebas de la API con MySQL</h1>' +
  '<p>Respuestas obtenidas por scripts/verificar-api.mjs mediante peticiones HTTP reales. Fecha UTC: ' + new Date().toISOString() + '</p>' +
  tarjetas + '</main><script>const nums=new URLSearchParams(location.search).get("casos");if(nums){const s=new Set(nums.split(","));document.querySelectorAll("article").forEach(a=>{if(!s.has(a.dataset.numero))a.remove()})}</script></html>';
await writeFile(path.join(root,'capturas','informe.html'),html);
console.log('Verificadas ' + resultados.length + ' peticiones HTTP; informe y respuestas guardados.');
