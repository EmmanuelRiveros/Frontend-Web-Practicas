import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSesion } from '../sesion/useSesion.ts';
import { mensajeDeError } from '../servicios/api.ts';

export default function PaginaEntrar() {
  const { entrar } = useSesion();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null); // limpia el error del intento anterior
    setEnviando(true);
    try {
      await entrar(correo, password);
      navegar('/clases');
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'));
    } finally {
      setEnviando(false); // salga bien o mal, se vuelve a habilitar el botón
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h1>Entrar</h1>
      {error && <p className="aviso aviso--error">{error}</p>}
      <label className="campo">
        <span className="campo__etiqueta">Correo</span>
        <input className="campo__control" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>
      <label className="campo">
        <span className="campo__etiqueta">Contraseña</span>
        <input className="campo__control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="boton boton--ancho" type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="formulario__pie">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </form>
  );
}