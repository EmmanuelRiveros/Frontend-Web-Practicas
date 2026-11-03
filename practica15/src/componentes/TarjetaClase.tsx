import { Link } from 'react-router';
import type { Clase } from '../tipos.ts';
import { urlImagen } from '../servicios/api.ts';
export function TarjetaClase({ clase }: { clase: Clase }) {
  return <Link to={`/clases/${clase.id}`} className="tarjeta-clase" aria-label={`Ver horarios de ${clase.nombre}`}>
    <img className="tarjeta-clase__imagen" src={urlImagen(clase.imagen)} alt={clase.nombre} />
    <div className="tarjeta-clase__cuerpo"><span className={`etiqueta etiqueta--${clase.categoria}`}>{clase.categoria}</span><span className="tarjeta-clase__titulo">{clase.nombre}</span><span className="tarjeta-clase__meta">{clase.duracionMin} min</span></div>
  </Link>;
}
