import { useEffect, useState } from 'react';
import type { Producto } from '../datos';
import { pedirProductos } from '../servicios/tienda';
import { mensajeDeError } from '../servicios/api';

export function useProductos() {
  const [datos, setDatos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let vigente = true;
    pedirProductos()
      .then(productos => { if (vigente) setDatos(productos); })
      .catch((fallo: unknown) => { if (vigente) setError(mensajeDeError(fallo)); })
      .finally(() => { if (vigente) setCargando(false); });
    // StrictMode ejecuta otro ciclo en desarrollo. La respuesta anterior se ignora.
    return () => { vigente = false; };
  }, [revision]);
  function reintentar() { setCargando(true); setError(null); setRevision(anterior => anterior + 1); }
  return { datos, cargando, error, reintentar };
}
