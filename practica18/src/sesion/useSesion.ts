import { createContext, useContext } from 'react';
import type { Usuario } from '../tipos.ts';

interface ValorSesion {
  usuario: Usuario | null;
  entrar: (correo: string, password: string) => Promise<void>;
  registrar: (nombre: string, correo: string, password: string) => Promise<void>;
  salir: () => void;
}

export const SesionContext = createContext<ValorSesion | null>(null);

export function useSesion() {
  const valor = useContext(SesionContext);
  if (!valor) throw new Error('useSesion() tiene que usarse dentro de <ProveedorSesion>');
  return valor;
}