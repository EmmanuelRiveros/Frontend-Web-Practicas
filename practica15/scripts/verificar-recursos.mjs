import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const registros = JSON.parse(await readFile(new URL('../evidencias/recursos-originales.json', import.meta.url), 'utf8'));
for (const { archivo, sha256 } of registros) {
  const datos = await readFile(new URL(`../${archivo}`, import.meta.url));
  assert.equal(createHash('sha256').update(datos).digest('hex'), sha256, archivo);
}
console.log(`${registros.length} recursos originales coinciden byte por byte.`);
