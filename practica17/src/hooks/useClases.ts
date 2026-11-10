// hooks/useClases.ts — RECURSO: el mismo patrón de useProductos (Práctica 14).
// Pide las clases al montar y regresa los tres estados de toda petición.
import { useEffect, useState } from 'react';
import { traerClases } from '../servicios/gimnasio.ts';
import { mensajeDeError } from '../servicios/api.ts';
import type { Clase } from '../tipos.ts';

export function useClases() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0); // cambiarlo repite el efecto

  useEffect(() => {
    let vigente = true; // ¿este efecto sigue siendo el actual?
    traerClases()
      .then((lista) => { if (vigente) setClases(lista); })
      .catch((e) => { if (vigente) setError(mensajeDeError(e, 'No se pudo conectar con el gimnasio.')); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; }; // la limpieza
  }, [intento]);

  function reintentar() {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }

  return { clases, cargando, error, reintentar };
}
