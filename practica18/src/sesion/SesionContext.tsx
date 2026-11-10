import { useEffect, useState, type ReactNode } from 'react';
import { SesionContext } from './useSesion.ts';
import * as servicio from '../servicios/sesion.ts';
import type { Sesion, Usuario } from '../tipos.ts';
import { useInscripciones } from '../estado/inscripciones.ts';

function leerUsuario(): Usuario | null {
  const guardado = localStorage.getItem('usuario');
  if (!guardado || !localStorage.getItem('token')) return null;
  try {
    const usuario = JSON.parse(guardado) as Usuario | null;
    return usuario && typeof usuario.nombre === 'string' && typeof usuario.correo === 'string'
      ? usuario
      : null;
  } catch {
    return null;
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuario);

  function guardar(sesion: Sesion) {
    useInscripciones.getState().vaciar();
    localStorage.setItem('token', sesion.token);
    localStorage.setItem('usuario', JSON.stringify(sesion.usuario));
    setUsuario(sesion.usuario);
  }

  async function entrar(correo: string, password: string) {
    guardar(await servicio.entrar(correo, password));
  }

  async function registrar(nombre: string, correo: string, password: string) {
    guardar(await servicio.registrar(nombre, correo, password));
  }

  function salir() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    useInscripciones.getState().vaciar();
    setUsuario(null);
  }

  useEffect(() => {
    const alTerminar = () => {
      useInscripciones.getState().vaciar();
      setUsuario(null);
    };
    window.addEventListener('sesion-terminada', alTerminar);
    return () => window.removeEventListener('sesion-terminada', alTerminar);
  }, []);

  useEffect(() => {
    if (usuario) useInscripciones.getState().cargar();
  }, [usuario]);

  return (
    <SesionContext value={{ usuario, entrar, registrar, salir }}>
      {children}
    </SesionContext>
  );
}
