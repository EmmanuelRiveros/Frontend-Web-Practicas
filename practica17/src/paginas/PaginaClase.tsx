import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useClase } from '../hooks/useClase.ts';
import { useSesion } from '../sesion/useSesion.ts';
import { inscribirse } from '../servicios/gimnasio.ts';
import { mensajeDeError, urlImagen } from '../servicios/api.ts';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';

interface Aviso {
  tipo: 'exito' | 'error';
  texto: string;
}

export default function PaginaClase() {
  const { id } = useParams();
  const { clase, cargando, error, reintentar } = useClase(Number(id));
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { usuario } = useSesion();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function inscribir(horarioId: number) {
    if (!usuario) {
      navegar('/entrar', { state: { desde: ubicacion.pathname + ubicacion.search + ubicacion.hash } });
      return;
    }
    setEnviando(true);
    setAviso(null);
    try {
      await inscribirse(horarioId);
      setAviso({ tipo: 'exito', texto: '¡Listo! Ya estás inscrito. Lo verás en Mis inscripciones.' });
      reintentar();
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeDeError(e, 'No se pudo completar la inscripción.') });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <Cargando />;
  if (error || !clase) return <MensajeError mensaje={error ?? 'No existe esa clase.'} onReintentar={reintentar} />;

  return (
    <>
      <Link to="/clases" className="detalle__volver">← Todas las clases</Link>
      <article className="detalle">
        <img className="detalle__imagen" src={urlImagen(clase.imagen)} alt={clase.nombre} />
        <div className="detalle__datos">
          <span className={`etiqueta etiqueta--${clase.categoria}`}>{clase.categoria}</span>
          <h1>{clase.nombre}</h1>
          <p className="pagina__bajada">{clase.descripcion} · {clase.duracionMin} min</p>

          <h2>Horarios</h2>
          {aviso && <p className={`aviso aviso--${aviso.tipo}`}>{aviso.texto}</p>}
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
                  <button type="button" className="boton boton--chico" disabled={enviando} onClick={() => inscribir(h.id)}>
                    Inscribirme
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </>
  );
}