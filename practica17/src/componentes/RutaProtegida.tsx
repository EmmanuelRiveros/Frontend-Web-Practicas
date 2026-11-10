import { Navigate, Outlet, useLocation } from 'react-router';
import { useSesion } from '../sesion/useSesion.ts';

export function RutaProtegida() {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname + ubicacion.search + ubicacion.hash }} />;
  }

  return <Outlet />;
}
