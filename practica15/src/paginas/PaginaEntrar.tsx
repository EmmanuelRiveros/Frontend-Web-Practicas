import { Link } from 'react-router';
export function PaginaEntrar() {
  return <section className="formulario"><h1>Entrar</h1><p>El inicio de sesión se implementa en la práctica 16. Esta pantalla es el destino del botón Inscribirme de la práctica 15.</p><Link to="/clases" className="boton boton--secundario">Volver a las clases</Link></section>;
}
