// hooks/useMisInscripciones.ts — RECURSO: el mismo patrón de useClases, otra vez.
import { useEffect, useState } from 'react';
import { traerMisInscripciones } from '../servicios/gimnasio.ts';
import { mensajeDeError } from '../servicios/api.ts';
import type { Inscripcion } from '../tipos.ts';

export function useMisInscripciones() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    traerMisInscripciones()
      .then((lista) => { if (vigente) setInscripciones(lista); })
      .catch((e) => { if (vigente) setError(mensajeDeError(e, 'No se pudieron cargar tus inscripciones.')); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [intento]);

  function reintentar() {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }

  return { inscripciones, cargando, error, reintentar };
}
