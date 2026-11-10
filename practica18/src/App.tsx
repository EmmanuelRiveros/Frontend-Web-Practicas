import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './componentes/Layout.tsx';
import { NoEncontrado } from './componentes/NoEncontrado.tsx';

const PaginaClases = lazy(() => import('./paginas/PaginaClases.tsx'));
const PaginaClase = lazy(() => import('./paginas/PaginaClase.tsx'));
const PaginaEntrar = lazy(() => import('./paginas/PaginaEntrar.tsx'));
const PaginaRegistro = lazy(() => import('./paginas/PaginaRegistro.tsx'));
const PaginaMisInscripciones = lazy(() => import('./paginas/PaginaMisInscripciones.tsx'));

import { RutaProtegida } from './componentes/RutaProtegida.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/clases" replace />} />

        <Route path="clases">
          <Route index element={<PaginaClases />} />       {/* /clases   */}
          <Route path=":id" element={<PaginaClase />} />   {/* /clases/3 */}
        </Route>

        <Route path="entrar" element={<PaginaEntrar />} />          {/* /entrar   */}
        <Route path="registro" element={<PaginaRegistro />} />      {/* /registro */}

        <Route element={<RutaProtegida />}>
          <Route path="mis-inscripciones" element={<PaginaMisInscripciones />} />  {/* /mis-inscripciones */}
        </Route>

        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}