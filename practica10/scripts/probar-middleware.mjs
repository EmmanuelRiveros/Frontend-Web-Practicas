import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const archivo = new URL('../dist/src/comun/middleware/peticion-id.middleware.js',import.meta.url);
const original=await readFile(archivo,'utf8');
const require=createRequire(archivo);
const resultados=[];
for(const sinNext of [true,false]) {
  const caja={exports:{},require};
  // Experimento aislado: no modifica el archivo ni deja la API bloqueada.
  vm.runInNewContext(sinNext?original.replace('next();','/* next omitido en esta copia */'):original,caja);
  const middleware=new caja.exports.PeticionIdMiddleware();
  const servidor=createServer((req,res)=>middleware.use(req,res,()=>res.end('siguiente ejecutado')));
  await new Promise(r=>servidor.listen(0,'127.0.0.1',r));
  const inicio=Date.now();
  let resultado;
  try {
    const respuesta=await fetch('http://127.0.0.1:'+servidor.address().port,{signal:AbortSignal.timeout(350)});
    resultado={sinNext,status:respuesta.status,texto:await respuesta.text(),duracionMs:Date.now()-inicio};
    assert.equal(sinNext,false); assert.equal(resultado.status,200);
  } catch(e) {
    assert.equal(sinNext,true); assert.equal(e.name,'TimeoutError');
    resultado={sinNext,status:'Sin respuesta antes del timeout',duracionMs:Date.now()-inicio};
  } finally {
    servidor.closeAllConnections(); await new Promise(r=>servidor.close(r));
  }
  resultados.push(resultado);
}
await writeFile('evidencias/experimento-next.json',JSON.stringify(resultados,null,2));
console.log(resultados);
