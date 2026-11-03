// tipos.ts — RECURSO: no se teclea, se copia del código base.
// La forma de lo que regresa gimnasio-backend. Trae los tipos de las cuatro
// prácticas: los que todavía no se usan no estorban.

export type Categoria = 'fuerza' | 'cardio' | 'flexibilidad';

// GET /clases
export interface Clase {
  id: number;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  duracionMin: number;
  imagen: string; // ruta en la API: /img/clase-01.jpg
}

// Cada horario que viene dentro de GET /clases/:id
export interface Horario {
  id: number;
  dia: string;
  horaInicio: string;
  entrenador: string;
  cupoMaximo: number;
  disponibles: number; // cuántos lugares quedan
}

// GET /clases/:id
export interface ClaseConHorarios extends Clase {
  horarios: Horario[];
}

// Práctica 16 · quién inició sesión (viene en la respuesta del login)
export interface Usuario {
  correo: string;
  nombre: string;
  rol: 'miembro' | 'entrenador' | 'admin';
}

// Práctica 16 · lo que guardamos al iniciar sesión
export interface Sesion {
  token: string;
  usuario: Usuario;
}

// Práctica 17 · GET /inscripciones/mias
export interface Inscripcion {
  id: number;
  estado: 'confirmada' | 'cancelada';
  creadaEn: string;
  horario: { id: number; dia: string; horaInicio: string; entrenador: string };
  clase: { id: number; nombre: string; imagen: string };
}
