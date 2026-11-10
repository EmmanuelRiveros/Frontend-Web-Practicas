// <PaginaRegistro> — RECURSO: viene completa en el código base.
// Es PaginaEntrar con un campo más (nombre) y registrar() en lugar de entrar().
// La API crea al miembro y regresa el token: quien se registra ya queda con sesión.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSesion } from '../sesion/useSesion.ts';
import { mensajeDeError } from '../servicios/api.ts';

export default function PaginaRegistro() {
  const { registrar } = useSesion();
  const navegar = useNavigate();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrar(nombre, correo, password);
      navegar('/clases');
    } catch (e) {
      // 400: los mensajes del DTO, juntos. 409: "Ese correo ya esta registrado".
      setError(mensajeDeError(e, 'No se pudo crear la cuenta.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h1>Crear cuenta</h1>
      {error && <p className="aviso aviso--error">{error}</p>}
      <label className="campo">
        <span className="campo__etiqueta">Nombre</span>
        <input className="campo__control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </label>
      <label className="campo">
        <span className="campo__etiqueta">Correo</span>
        <input className="campo__control" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>
      <label className="campo">
        <span className="campo__etiqueta">Contraseña (8 caracteres o más)</span>
        <input className="campo__control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="boton boton--ancho" type="submit" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear cuenta'}
      </button>
      <p className="formulario__pie">¿Ya tienes cuenta? <Link to="/entrar">Entra</Link></p>
    </form>
  );
}
