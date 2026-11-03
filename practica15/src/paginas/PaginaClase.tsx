import { Link, useNavigate, useParams } from 'react-router';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';
import { useClase } from '../hooks/useClase.ts';
import { urlImagen } from '../servicios/api.ts';
export function PaginaClase() {
  const { id } = useParams<{ id: string }>();
  const numero = id && /^[1-9]\d*$/.test(id) ? Number(id) : Number.NaN;
  const { clase, cargando, error, reintentar } = useClase(numero);
  const navegar = useNavigate();
  return <><Link to="/clases" className="detalle__volver">← Todas las clases</Link>
    {cargando ? <Cargando /> : error ? <MensajeError mensaje={error} onReintentar={reintentar} /> : clase && <article className="detalle">
      <img className="detalle__imagen" src={urlImagen(clase.imagen)} alt={clase.nombre} />
      <div className="detalle__datos"><span className={`etiqueta etiqueta--${clase.categoria}`}>{clase.categoria}</span><h1>{clase.nombre}</h1>
        <p className="pagina__bajada">{clase.descripcion} · {clase.duracionMin} min</p>
        <h2>Horarios</h2>
        {clase.horarios.length ? <ul className="horarios">{clase.horarios.map(h => <li className="horario" key={h.id}>
          <div><div className="horario__dia">{h.dia} · {h.horaInicio}</div><div className="horario__meta">{h.entrenador} · {h.disponibles} de {h.cupoMaximo} lugares</div></div>
          {h.disponibles === 0 ? <span className="horario__lleno">Lleno</span> : <button type="button" className="boton boton--chico" onClick={() => navegar('/entrar')}>Inscribirme</button>}
        </li>)}</ul> : <p>No hay horarios publicados para esta clase.</p>}
      </div>
    </article>}
  </>;
}
