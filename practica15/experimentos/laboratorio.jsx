import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route, Link, useParams } from 'react-router';
import { Layout } from '../src/componentes/Layout.tsx';
import { useClases } from '../src/hooks/useClases.ts';
import { traerClase } from '../src/servicios/gimnasio.ts';
import { urlImagen } from '../src/servicios/api.ts';
import '../src/index.css';
function CatalogoHref() {
  const { clases } = useClases();
  return <><h1>Experimento con a href</h1><p>Las tarjetas navegan solicitando un documento nuevo.</p><div className="rejilla">{clases.map(c => <a key={c.id} href={`/clases/${c.id}`} className="tarjeta-clase"><img className="tarjeta-clase__imagen" src={urlImagen(c.imagen)} alt={c.nombre}/><div className="tarjeta-clase__cuerpo"><span className={`etiqueta etiqueta--${c.categoria}`}>{c.categoria}</span><span className="tarjeta-clase__titulo">{c.nombre}</span><span className="tarjeta-clase__meta">{c.duracionMin} min</span></div></a>)}</div></>;
}
function SinId() {
  const { id } = useParams(); const [clase, setClase] = useState(null);
  useEffect(() => { let vigente = true; traerClase(Number(id)).then(c => { if(vigente) setClase(c); }); return () => { vigente = false; }; }, []);
  return <main className="disposicion__contenido"><h1>Experimento sin id en las dependencias</h1><p>Parámetro de la URL: {id}</p><p>Clase que permanece en pantalla: <strong>{clase?.nombre ?? 'Cargando'}</strong></p><Link className="boton" to="/clases/1">Ir a clase 1</Link> <Link className="boton" to="/clases/2">Ir a clase 2</Link><p>El componente se conserva, pero el efecto con [] no vuelve a consultar al cambiar el parámetro.</p></main>;
}
const sinId = new URLSearchParams(location.search).get('caso') === 'sin-id';
createRoot(document.getElementById('root')).render(sinId ? <HashRouter><Routes><Route path="clases/:id" element={<SinId/>}/></Routes></HashRouter> : <BrowserRouter><Routes><Route element={<Layout/>}><Route path="/experimentos/index.html" element={<CatalogoHref/>}/></Route></Routes></BrowserRouter>);
