import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { pedirProductos } from '../src/servicios/tienda';
import '../src/index.css';
function SinDependencias() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let vigente = true;
    const turno = setTimeout(() => {
      pedirProductos().then(datos => { if (vigente) setProductos(datos); }).catch(e => { if (vigente) setError(e.message); });
    }, 200);
    return () => { vigente = false; clearTimeout(turno); };
  }); // Sin segundo argumento: se ejecuta después de cada render.
  return <main className="contenido"><h1>Experimento sin arreglo de dependencias</h1><p>La petición cambia el estado, React renderiza y el efecto vuelve a pedir los productos.</p><p>Productos recibidos: {productos.length}. {error}</p><p>La pausa de 200 ms facilita observar Red; no soluciona el ciclo. Recarga o cierra esta pestaña para detenerlo.</p></main>;
}
function SinPreventDefault() {
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  return <main className="contenido"><h1>Formulario sin preventDefault</h1><p>Usa solo los datos ficticios del ejemplo. Al enviar, el navegador navega a esta misma página y reinicia el estado.</p><form className="pago" method="get" action="/experimentos/index.html"><input type="hidden" name="caso" value="formulario"/><label>Correo<input name="correo" value={correo} onChange={e => setCorreo(e.target.value)}/></label><label>Teléfono<input name="telefono" value={telefono} onChange={e => setTelefono(e.target.value)}/></label><button>Enviar sin preventDefault</button></form></main>;
}
createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).get('caso') === 'formulario' ? <SinPreventDefault /> : <SinDependencias />);
