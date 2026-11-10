import { Link, NavLink } from 'react-router';
import { useSesion } from '../sesion/useSesion.ts';
import { useInscripciones } from '../estado/inscripciones.ts';

function claseEnlace({ isActive }: { isActive: boolean }) {
  return isActive ? 'barra__enlace barra__enlace--activo' : 'barra__enlace';
}

export function Encabezado() {
  const { usuario, salir } = useSesion();
  const total = useInscripciones((estado) => estado.lista.length);

  return (
    <header className="barra">
      <div className="barra__interior">
        <Link to="/" className="barra__marca">
          <img src="/logo.svg" alt="" />
          Gimnasio Titanes
        </Link>

        <nav>
          <ul className="barra__enlaces">
            <li><NavLink to="/clases" className={claseEnlace}>Clases</NavLink></li>
            <li>
              <NavLink to="/mis-inscripciones" className={claseEnlace}>
                Mis inscripciones
                {usuario && <span className="barra__contador">{total}</span>}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="barra__sesion">
          {usuario ? (
            <>
              <span className="barra__usuario">Hola, {usuario.nombre}</span>
              <button className="boton boton--secundario boton--chico" onClick={salir}>Salir</button>
            </>
          ) : (
            <Link to="/entrar" className="boton boton--chico">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}