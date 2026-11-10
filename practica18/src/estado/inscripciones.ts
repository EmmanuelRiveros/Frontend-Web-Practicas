// estado/inscripciones.ts — un STORE de Zustand: estado que vive FUERA de React y que
// cualquier componente lee con un hook, sin Provider y sin pasarlo por props.
// Es la cuarta forma de guardar un dato: useState (un componente), props (padre → hijo),
// contexto (la sesión: muchos lo leen y cambia poco) y store (muchos lo leen y cambia seguido).
import { create } from 'zustand';
import { traerMisInscripciones } from '../servicios/gimnasio.ts';
import { mensajeDeError } from '../servicios/api.ts';
import type { Inscripcion } from '../tipos.ts';

// 1. LA FORMA DEL STORE: los datos y las funciones que los cambian, juntos.
//    Quien lo usa no sabe que cargar() habla con la API: sólo la llama.
interface EstadoInscripciones {
  lista: Inscripcion[];
  cargando: boolean;
  error: string | null;
  cargar: () => Promise<void>;
  vaciar: () => void;
}

// Vaciar invalida cualquier respuesta de una sesión anterior que siga en tránsito.
let revision = 0;

export const useInscripciones = create<EstadoInscripciones>()((set) => ({
  lista: [],
  cargando: true,
  error: null,

  cargar: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const carga = ++revision;
    const vigente = () => carga === revision && token === localStorage.getItem('token');
    set({ cargando: true, error: null });
    try {
      const lista = await traerMisInscripciones();
      if (vigente()) set({ lista, cargando: false });
    } catch (e) {
      if (vigente()) {
        set({ error: mensajeDeError(e, 'No se pudieron cargar tus inscripciones.'), cargando: false });
      }
    }
  },

  vaciar: () => {
    revision++;
    set({ lista: [], cargando: false, error: null });
  },
}));
