import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const evidence = path.join(root, 'evidencias');
await mkdir(evidence, { recursive: true });
const server = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5182', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', b => logs += b);
server.stderr.on('data', b => logs += b);
let browser;
const checks = [];
try {
  await Promise.race([
    new Promise((resolve, reject) => { server.stdout.on('data', () => { if (logs.includes('5182')) resolve(); }); server.on('error', reject); server.on('exit', c => reject(new Error('Vite cerró: ' + c + logs))); }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Vite no inició: ' + logs)), 20000)),
  ]);
  browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
  const page = await browser.newPage({ viewport: { width: 1200, height: 600 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const check = (name, ok) => { assert.ok(ok, name); checks.push({ caso: name, correcto: true }); };
  await page.goto('http://127.0.0.1:5182', { waitUntil: 'networkidle' });
  check('Saludo recibe nombre por props', await page.locator('h1').innerText() === 'Hola, Emmanuel');
  check('Tres tarjetas', await page.locator('article.tarjeta').count() === 3);
  check('Nombres desde props', JSON.stringify(await page.locator('.tarjeta__nombre').allTextContents()) === JSON.stringify(['Juan Pérez', 'María García', 'Carlos López']));
  check('Iniciales calculadas', JSON.stringify(await page.locator('.tarjeta__avatar').allTextContents()) === JSON.stringify(['JP', 'MG', 'CL']));
  check('Semestres numéricos', JSON.stringify(await page.locator('.tarjeta__semestre').allTextContents()) === JSON.stringify(['Semestre: 5', 'Semestre: 4', 'Semestre: 3']));
  await page.screenshot({ path: path.join(evidence, '07-tres-tarjetas.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 940 });
  check('Sin desbordamiento móvil', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: path.join(evidence, '08-movil.png'), fullPage: true });
  await page.setViewportSize({ width: 1200, height: 600 });
  await page.goto('http://127.0.0.1:5182/?vista=sin-jsx', { waitUntil: 'networkidle' });
  check('Hola mundo sin JSX', await page.locator('h1').innerText() === 'Hola mundo sin JSX');
  check('Tarjeta sin JSX con tres hijos', await page.locator('article > *').count() === 3);
  await page.screenshot({ path: path.join(evidence, '06-hola-sin-jsx.png'), fullPage: true });
  check('Sin errores en navegador: ' + JSON.stringify(errors), errors.length === 0);
  const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const cards = [
    ['01-swc-sin-configuracion.png', 'SWC sin configuración', await readFile(path.join(evidence, '01-swc-sin-configuracion.txt'), 'utf8')],
    ['02-swc-clasico.png', 'SWC en modo clásico', await readFile(path.join(evidence, '02-swc-clasico.txt'), 'utf8') + '\nSalida generada\n\n' + await readFile(path.join(root, 'laboratorio-swc/salidas/clasico.js'), 'utf8')],
    ['03-swc-automatico.png', 'SWC en modo automático', await readFile(path.join(evidence, '03-swc-automatico.txt'), 'utf8') + '\nSalida generada\n\n' + await readFile(path.join(root, 'laboratorio-swc/salidas/automatico.js'), 'utf8')],
    ['04-prop-obligatoria.png', 'Prop obligatoria ausente', await readFile(path.join(evidence, '04-prop-obligatoria.txt'), 'utf8')],
  ];
  for (const [name, title, body] of cards) {
    await page.setContent(`<html lang="es"><meta charset="utf-8"><style>body{margin:0;padding:30px;font:16px 'Segoe UI',sans-serif;background:#fff;color:#111827}h1{font-size:24px}p{color:#4b5563}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:15px/1.5 Consolas,monospace;background:#f3f4f6;padding:20px;border:1px solid #d1d5db}</style><h1>${title}</h1><p>Registro de ejecución y archivo generado por las herramientas</p><pre>${escape(body)}</pre></html>`);
    await page.locator('body').screenshot({ path: path.join(evidence, name) });
  }
  await writeFile(path.join(evidence, 'verificacion.json'), JSON.stringify({ node: process.version, casos: checks, errores: errors }, null, 2) + '\n');
  console.log(JSON.stringify(checks, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill();
}
