import { Link } from 'react-router'
import { useClases } from '../hooks/useClases.ts'
import { urlImagen } from '../servicios/api.ts'
import { Cargando } from '../componentes/Cargando.tsx'
import { MensajeError } from '../componentes/MensajeError.tsx'


export default function PaginaClases() {
    const { clases, cargando, error, reintentar } = useClases();

    return (
        <>
        <section className="pagina__encabezado">
            <h1>Clases</h1>
            <p className="pagina__bajada">Elige una clase para ver sus horarios e inscribirte.</p>
            </section>

            {cargando && <Cargando />}
            {error && <MensajeError mensaje={error} onReintentar={reintentar} />}
            <div className="rejilla">
                {clases.map((c) => (
                    <Link key={c.id} to={`/clases/${c.id}`} className="tarjeta-clase">
                        <img className="tarjeta-clase__imagen" src={urlImagen(c.imagen)} alt={c.nombre} loading="lazy" />
                        <div className="tarjeta-clase__cuerpo">
                        <span className={`etiqueta etiqueta--${c.categoria}`}>{c.categoria}</span>
                        <span className="tarjeta-clase__titulo">{c.nombre}</span>
                        <span className="tarjeta-clase__meta">{c.duracionMin} min</span>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
