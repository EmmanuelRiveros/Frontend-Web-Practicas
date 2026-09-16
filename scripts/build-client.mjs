import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

const sourcePath = new URL('../publico/cliente.ts', import.meta.url);
const outputPath = new URL('../publico/cliente.js', import.meta.url);

const source = await readFile(sourcePath, 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
  fileName: 'cliente.ts',
});

await writeFile(outputPath, result.outputText, 'utf8');
