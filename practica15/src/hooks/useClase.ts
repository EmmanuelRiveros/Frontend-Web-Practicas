import { useEffect, useState } from 'react';
import type { ClaseConHorarios } from '../tipos.ts';
import { traerClase } from '../servicios/gimnasio.ts';
import { mensajeDeError } from '../servicios/api.ts';
interface Resultado { id: number; intento: number; clase: ClaseConHorarios | null; error: string | null }
export function useClase(id: number) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [intento, setIntento] = useState(0);
  const valido = Number.isSafeInteger(id) && id > 0;
  useEffect(() => {
    if (!Number.isSafeInteger(id) || id <= 0) return;
    let vigente = true;
    traerClase(id)
      .then(clase => { if (vigente) setResultado({ id, intento, clase, error: null }); })
      .catch((e: unknown) => { if (vigente) setResultado({ id, intento, clase: null, error: mensajeDeError(e, 'No se pudo consultar esta clase.') }); });
    return () => { vigente = false; };
  }, [id, intento]);
  const actual = resultado?.id === id && resultado.intento === intento;
  return {
    clase: actual ? resultado.clase : null,
    cargando: valido && !actual,
    error: !valido ? 'El identificador de clase debe ser un entero positivo.' : actual ? resultado.error : null,
    reintentar: () => setIntento(n => n + 1),
  };
}
