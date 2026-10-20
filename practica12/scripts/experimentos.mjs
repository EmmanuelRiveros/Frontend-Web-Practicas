import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const lab = path.join(root, 'laboratorio-swc');
const evidence = path.join(root, 'evidencias');
mkdirSync(evidence, { recursive: true });
mkdirSync(path.join(lab, 'salidas'), { recursive: true });
const results = [];
function run(name, cwd, cli, args, expected, pattern) {
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  const output = `${r.stdout || ''}${r.stderr || ''}`;
  const passed = expected === 'error' ? r.status !== null && r.status !== 0 && pattern.test(output) : r.status === 0;
  const text = `$ node ${path.relative(cwd, cli)} ${args.join(' ')}\n\n${output}\nCódigo de salida: ${r.status}\nResultado esperado: ${expected}\n`;
  writeFileSync(path.join(evidence, name + '.txt'), text);
  results.push({ caso: name, codigo: r.status, correcto: passed });
  if (!passed) throw new Error(`Falló ${name}: ${output}`);
}
const swc = path.join(lab, 'node_modules/@swc/cli/bin/swc.js');
run('01-swc-sin-configuracion', lab, swc, ['Saludo.jsx', '--no-swcrc'], 'error', /Expression expected|Unexpected token|Syntax Error/i);
run('02-swc-clasico', lab, swc, ['Saludo.jsx', '--config-file', '.swcrc.clasico', '-o', 'salidas/clasico.js'], 'exito');
run('03-swc-automatico', lab, swc, ['Saludo.jsx', '--config-file', '.swcrc.automatico', '-o', 'salidas/automatico.js'], 'exito');
run('04-prop-obligatoria', root, path.join(root, 'node_modules/typescript/bin/tsc'), ['--ignoreConfig', '--noEmit', '--strict', '--jsx', 'react-jsx', '--module', 'esnext', '--moduleResolution', 'bundler', '--target', 'es2022', '--skipLibCheck', 'experimentos/SaludoSinNombre.tsx'], 'error', /TS2741.*nombre/);
const classic = readFileSync(path.join(lab, 'salidas/clasico.js'), 'utf8');
const automatic = readFileSync(path.join(lab, 'salidas/automatico.js'), 'utf8');
if (!classic.includes('React.createElement') || !automatic.includes('react/jsx-runtime')) throw new Error('Transformaciones inesperadas');
writeFileSync(path.join(evidence, 'experimentos.json'), JSON.stringify({ node: process.version, casos: results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
