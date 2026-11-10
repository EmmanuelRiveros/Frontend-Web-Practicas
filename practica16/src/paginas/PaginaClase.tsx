import { Link, useParams, useNavigate } from 'react-router';
import { useClase } from '../hooks/useClase.ts';
import { urlImagen } from '../servicios/api.ts';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';

export default function PaginaClase() {

    const { id } = useParams();

    const { clase, cargando, error, reintentar } = useClase(Number(id));

    const navegar = useNavigate();

    if (cargando) return <Cargando />;
    if (error || !clase) return <MensajeError mensaje={error ?? 'No existe la clase.'} onReintentar={reintentar} />;


    return (
        <>
            <Link to="/clases" className="detalle__volver">← Todas las clases</Link>

            <article className="detalle">
            <img className="detalle__imagen" src={urlImagen(clase.imagen)} alt={clase.nombre}/>
            <div className="detalle__datos">
                <span className={`etiqueta etiqueta--${clase.categoria}`}>{clase.categoria}</span>
                <h1>{clase.nombre}</h1>
                <p className="pagina__bajada">{clase.descripcion} · {clase.duracionMin} min</p>

                <h2>Horarios</h2>
                <ul className="horarios">
                    {clase.horarios.map((h) => (
                        <li key={h.id} className="horario">
                            <div>
                                <div className="horario__dia">{h.dia} · {h.horaInicio}</div>
                                <div className="horario__meta">{h.entrenador} · {h.disponibles} de {h.cupoMaximo} lugares</div>
                            </div>
                            {h.disponibles === 0 ? (
                                <span className="horario__lleno">Lleno</span>
                            ) : (
                                <button className="boton boton--chico" onClick={() => navegar('/entrar')}>Inscribirme</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            </article>
        </>
    )
}
