import { useClases } from '../hooks/useClases.ts';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';
import { TarjetaClase } from '../componentes/TarjetaClase.tsx';
export function PaginaClases() {
  const { clases, cargando, error, reintentar } = useClases();
  return <><section className="pagina__encabezado"><h1>Clases</h1><p className="pagina__bajada">Elige una clase para ver sus horarios e inscribirte.</p></section>
    {cargando ? <Cargando /> : error ? <MensajeError mensaje={error} onReintentar={reintentar} /> : clases.length ? <div className="rejilla">{clases.map(clase => <TarjetaClase key={clase.id} clase={clase} />)}</div> : <p className="vacio">No hay clases disponibles.</p>}
  </>;
}
