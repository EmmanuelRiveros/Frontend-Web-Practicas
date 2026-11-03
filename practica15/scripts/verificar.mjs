import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const raiz = fileURLToPath(new URL('../', import.meta.url));
const backend = process.env.GIMNASIO_BACKEND ?? fileURLToPath(new URL('../../../gimnasio-backend/', import.meta.url));
const evidencia = new URL('../evidencias/', import.meta.url);
await mkdir(evidencia, { recursive: true });
const procesos = [];
function iniciar(cwd, archivo, args = []) {
  const p = spawn(process.execPath, [archivo, ...args], { cwd, windowsHide: true, stdio: 'ignore' });
  procesos.push(p); return p;
}
async function listo(url) {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(url)).ok) return; } catch { /* Esperar inicio. */ }
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`No inició ${url}`);
}
const resultados = [];
const comprobar = (caso, datos = {}) => resultados.push({ caso, resultado: 'correcto', ...datos });
let navegador;
try {
  // Solo inicia procesos propios; no modifica ni reinicializa la base.
  iniciar(backend, 'dist/main.js');
  iniciar(raiz, 'node_modules/vite/bin/vite.js', ['--host', '127.0.0.1', '--port', '5173', '--strictPort']);
  await Promise.all([listo('http://localhost:3000/clases'), listo('http://localhost:5173')]);
  navegador = await chromium.launch({ channel: 'chrome', headless: true, args: ['--remote-debugging-port=9333', '--remote-allow-origins=*'] });
  const contexto = await navegador.newContext({ viewport: { width: 1200, height: 900 } });
  const pagina = await contexto.newPage();
  const errores = [], solicitudes = [];
  pagina.on('pageerror', e => errores.push(e.message));
  pagina.on('request', r => solicitudes.push({ url: r.url(), tipo: r.resourceType() }));
  const foto = nombre => pagina.screenshot({ path: fileURLToPath(new URL(nombre, evidencia)), fullPage: true });
  await pagina.goto('http://localhost:5173/');
  await pagina.waitForSelector('.tarjeta-clase:nth-child(8)');
  assert.equal(new URL(pagina.url()).pathname, '/clases');
  assert.equal(await pagina.locator('.tarjeta-clase').count(), 8);
  await pagina.waitForFunction(() => [...document.querySelectorAll('.tarjeta-clase img')].every(i => i.complete && i.naturalWidth > 0));
  await foto('01-catalogo.png');
  comprobar('Redirección inicial y catálogo de ocho clases con imágenes de la API');
  await pagina.evaluate(() => { window.marcaDocumento = 'conservado'; window.encabezadoOriginal = document.querySelector('header'); });
  solicitudes.length = 0;
  await pagina.getByRole('link', { name: 'Ver horarios de Fuerza total', exact: true }).click();
  await pagina.getByRole('heading', { name: 'Fuerza total', exact: true }).waitFor();
  assert.equal(await pagina.locator('.horario').count(), 3);
  const lleno = pagina.locator('.horario').filter({ hasText: 'Lleno' });
  assert.equal(await lleno.count(), 1); assert.equal(await lleno.locator('button').count(), 0);
  assert.equal(await pagina.getByRole('button', { name: 'Inscribirme' }).count(), 2);
  assert.equal(await pagina.evaluate(() => window.encabezadoOriginal === document.querySelector('header')), true);
  assert.equal(solicitudes.filter(r => r.tipo === 'document').length, 0);
  await foto('02-detalle.png');
  comprobar('Detalle con entrenador, disponibilidad y horario lleno sin botón', { documentosLink: 0 });
  await pagina.getByRole('button', { name: 'Inscribirme' }).first().click();
  await pagina.getByRole('heading', { name: 'Entrar', exact: true }).waitFor();
  assert.equal(await pagina.evaluate(() => window.marcaDocumento), 'conservado');
  comprobar('Inscribirme navega a /entrar sin recargar');
  await pagina.goBack(); await pagina.getByRole('heading', { name: 'Fuerza total', exact: true }).waitFor();
  await pagina.evaluate(() => { history.pushState(null, '', '/clases/2'); dispatchEvent(new PopStateEvent('popstate')); });
  await pagina.getByRole('heading', { name: 'Ciclismo indoor', exact: true }).waitFor();
  assert.equal(await pagina.locator('.horario').count(), 2);
  assert.match(await pagina.locator('.horarios').innerText(), /Luis Fierro/);
  assert.equal(await pagina.evaluate(() => window.encabezadoOriginal === document.querySelector('header')), true);
  await foto('06-cambio-id.png');
  comprobar('Misma ruta dinámica de id 1 a 2 actualiza clase, entrenador y horarios');
  await pagina.reload(); await pagina.getByRole('heading', { name: 'Ciclismo indoor', exact: true }).waitFor();
  comprobar('Acceso directo y recarga de /clases/2');
  for (const id of ['abc', '0', '1.5', '999']) {
    await pagina.goto(`http://localhost:5173/clases/${id}`);
    await pagina.locator('.error').waitFor();
    assert.equal(await pagina.locator('header').count(), 1);
    assert.equal(await pagina.locator('footer').count(), 1);
  }
  comprobar('Errores controlados para id no numérico, cero, decimal e inexistente');
  await pagina.goto('http://localhost:5173/ruta-inexistente');
  await pagina.getByRole('heading', { name: 'Esta página no existe' }).waitFor();
  assert.equal(await pagina.locator('header').count(), 1); assert.equal(await pagina.locator('footer').count(), 1);
  await foto('05-no-encontrado.png');
  await pagina.getByRole('link', { name: 'Ver las clases', exact: true }).click();
  await pagina.waitForSelector('.tarjeta-clase:nth-child(8)');
  comprobar('404 conserva encabezado y pie y permite volver al catálogo');
  // Herramientas de Chrome reales, conectadas a la página inspeccionada.
  await pagina.goto('about:blank');
  const objetivos = await (await fetch('http://127.0.0.1:9333/json/list')).json();
  const objetivo = objetivos.find(t => t.type === 'page' && t.url === 'about:blank');
  const devtools = await contexto.newPage();
  await devtools.setViewportSize({ width: 1100, height: 740 });
  await devtools.goto(`devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9333/devtools/page/${objetivo.id}&panel=network`);
  const screencast = devtools.getByRole('button', { name: 'Toggle screencast', exact: true });
  await screencast.waitFor();
  if (await screencast.getAttribute('aria-pressed') === 'true') await screencast.click();
  for (let i = 0; i < 3; i++) await devtools.keyboard.press('Control+=');
  const aviso = devtools.getByRole('button', { name: "Don't show again", exact: true });
  if (await aviso.count()) await aviso.click();
  await pagina.goto('http://localhost:5173/clases'); await pagina.waitForSelector('.tarjeta-clase:nth-child(8)');
  await pagina.waitForLoadState('networkidle');
  await devtools.getByRole('button', { name: /^Clear network log/ }).click();
  solicitudes.length = 0;
  await pagina.getByRole('link', { name: 'Ver horarios de Fuerza total', exact: true }).click();
  await pagina.getByRole('heading', { name: 'Fuerza total', exact: true }).waitFor();
  await pagina.waitForLoadState('networkidle');
  const link = [...solicitudes];
  assert.equal(link.filter(r => r.tipo === 'document').length, 0);
  await new Promise(r => setTimeout(r, 700));
  await devtools.screenshot({ path: fileURLToPath(new URL('03-red-link.png', evidencia)) });
  await pagina.goto('http://localhost:5173/experimentos/index.html');
  await pagina.waitForSelector('.tarjeta-clase:nth-child(8)'); await pagina.waitForLoadState('networkidle');
  await pagina.evaluate(() => { window.marcaDocumento = 'antes-del-href'; });
  await devtools.getByRole('button', { name: /^Clear network log/ }).click();
  solicitudes.length = 0;
  await pagina.locator('.tarjeta-clase').first().click();
  await pagina.getByRole('heading', { name: 'Fuerza total', exact: true }).waitFor();
  await pagina.waitForLoadState('networkidle');
  const href = [...solicitudes];
  assert.equal(href.filter(r => r.tipo === 'document').length, 1);
  assert.equal(await pagina.evaluate(() => window.marcaDocumento), undefined);
  await devtools.getByText('Doc', { exact: true }).click();
  await new Promise(r => setTimeout(r, 700));
  await devtools.screenshot({ path: fileURLToPath(new URL('04-red-href.png', evidencia)) });
  comprobar('Network real compara Link y a href', { documentosLink: 0, documentosHref: 1 });
  await devtools.close();
  await pagina.goto('http://localhost:5173/experimentos/index.html?caso=sin-id#/clases/1');
  await pagina.getByText('Fuerza total', { exact: true }).waitFor();
  solicitudes.length = 0;
  await pagina.getByRole('link', { name: 'Ir a clase 2', exact: true }).click();
  await pagina.getByText('Parámetro de la URL: 2', { exact: true }).waitFor();
  assert.equal(await pagina.locator('strong').innerText(), 'Fuerza total');
  assert.equal(solicitudes.filter(r => r.url.endsWith('/clases/2')).length, 0);
  await foto('07-efecto-sin-id.png');
  comprobar('Experimento aislado reproduce datos obsoletos al omitir id del efecto');
  assert.deepEqual(errores, []);
  comprobar('Sin excepciones JavaScript en los recorridos');
  await writeFile(new URL('red-comparacion.json', evidencia), JSON.stringify({ link, href }, null, 2));
  await writeFile(new URL('verificacion.json', evidencia), JSON.stringify({ fecha: new Date().toISOString(), resultados }, null, 2));
  console.log(`${resultados.length} comprobaciones correctas. Evidencias guardadas.`);
} finally {
  await navegador?.close();
  for (const p of procesos.reverse()) p.kill();
}
