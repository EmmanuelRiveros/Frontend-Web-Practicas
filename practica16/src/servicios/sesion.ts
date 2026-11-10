// servicios/sesion.ts — RECURSO: se copia del código base. Login y registro contra gimnasio-backend.
import { api, type Sobre } from './api.ts';
import type { Sesion, Usuario } from '../tipos.ts';

// Lo que regresa la API (Práctica 10): el token y, ahora, quién eres.
interface RespuestaToken {
  access_token: string;
  usuario: Usuario;
}

// POST /auth/login
export async function entrar(correo: string, password: string): Promise<Sesion> {
  const r = await api.post<Sobre<RespuestaToken>>('/auth/login', { correo, password });
  return { token: r.data.data.access_token, usuario: r.data.data.usuario };
}

// POST /auth/registro: crea el miembro y regresa lo mismo que el login.
export async function registrar(nombre: string, correo: string, password: string): Promise<Sesion> {
  const r = await api.post<Sobre<RespuestaToken>>('/auth/registro', { nombre, correo, password });
  return { token: r.data.data.access_token, usuario: r.data.data.usuario };
}
