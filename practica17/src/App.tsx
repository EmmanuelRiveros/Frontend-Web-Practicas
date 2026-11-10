import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './componentes/Layout.tsx'
import { NoEncontrado } from './componentes/NoEncontrado.tsx'
import PaginaClases from './paginas/PaginaClases.tsx'
import PaginaClase from './paginas/PaginaClase.tsx'
import PaginaEntrar from './paginas/PaginaEntrar.tsx';
import PaginaRegistro from './paginas/PaginaRegistro.tsx';
import PaginaMisInscripciones from './paginas/PaginaMisInscripciones.tsx';
import { RutaProtegida } from './componentes/RutaProtegida.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/clases" replace/>} />

        <Route path="/clases">
          <Route index element={<PaginaClases />} />
          <Route path=":id" element={<PaginaClase />} />
        </Route>

        <Route path="entrar" element={<PaginaEntrar />} />
        <Route path="registro" element={<PaginaRegistro />} />

        <Route element={<RutaProtegida />}>
          <Route path="mis-inscripciones" element={<PaginaMisInscripciones />} />  {/* /mis-inscripciones */}
        </Route>

        <Route path="*" element={<NoEncontrado />} />

      </Route>
    </Routes>
  )
}