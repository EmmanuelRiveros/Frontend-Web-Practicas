import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const original=JSON.parse(fs.readFileSync('evidencias/recursos-originales.json','utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [file,hash] of Object.entries(original.componentes))assert.equal(sha(fs.readFileSync('src/'+file,'utf8').replaceAll('\r\n','\n')),hash,file);
assert.equal(sha(fs.readFileSync('src/index.css')),original['index.css']);
for(const [file,hash] of Object.entries(original.imagenes))assert.equal(sha(fs.readFileSync('public/img/'+file)),hash,file);
console.log('Seis componentes sin cambios, CSS e imágenes originales verificados.');
