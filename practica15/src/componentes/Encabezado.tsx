// <Encabezado> — RECURSO: la marca, los enlaces y el botón de Entrar.
// NavLink es un <Link> que además sabe si su ruta es la actual: así se
// pinta el enlace activo sin una línea de JavaScript propio.
import { Link, NavLink } from 'react-router';

// La clase del enlace según si está activo o no.
function claseEnlace({ isActive }: { isActive: boolean }) {
  return isActive ? 'barra__enlace barra__enlace--activo' : 'barra__enlace';
}

export function Encabezado() {
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
            <li><NavLink to="/mis-inscripciones" className={claseEnlace}>Mis inscripciones</NavLink></li>
          </ul>
        </nav>

        {/* Práctica 16: aquí va quién inició sesión y el botón Salir. */}
        <div className="barra__sesion">
          <Link to="/entrar" className="boton boton--chico">Entrar</Link>
        </div>
      </div>
    </header>
  );
}
