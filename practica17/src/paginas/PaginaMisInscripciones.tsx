
import { Link } from 'react-router';
import { useMisInscripciones } from '../hooks/useMisInscripciones.ts';
import { urlImagen } from '../servicios/api.ts';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';

export default function PaginaMisInscripciones() {
  const { inscripciones, cargando, error, reintentar } = useMisInscripciones();

  if (cargando) return <Cargando />;
  if (error) return <MensajeError mensaje={error} onReintentar={reintentar} />;

  return (
    <>
      <section className="pagina__encabezado">
        <h1>Mis inscripciones</h1>
        <p className="pagina__bajada">
          {inscripciones.length === 0 ? 'Todavía no estás inscrito a ninguna clase.' : `${inscripciones.length} clase(s) esta semana.`}
        </p>
      </section>
      <ul className="inscripciones">
        {inscripciones.map((i) => (
          <li key={i.id} className="inscripcion">
            <img className="inscripcion__imagen" src={urlImagen(i.clase.imagen)} alt="" />
            <div>
              <Link to={`/clases/${i.clase.id}`} className="inscripcion__clase">{i.clase.nombre}</Link>
              <div className="inscripcion__meta">{i.horario.dia} · {i.horario.horaInicio} · {i.horario.entrenador}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}