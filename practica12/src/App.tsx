import { Saludo } from './Saludo';
import { TarjetaPerfil } from './TarjetaPerfil';

export default function App() {
  return (
    <main className="pagina">
      <Saludo nombre="Emmanuel" />
      <section className="equipo" aria-label="Perfiles del equipo">
        <TarjetaPerfil nombre="Juan Pérez" carrera="Ingeniería en Sistemas" semestre={5} />
        <TarjetaPerfil nombre="María García" carrera="Ingeniería en Computación" semestre={4} />
        <TarjetaPerfil nombre="Carlos López" carrera="Ingeniería en Electrónica" semestre={3} />
      </section>
    </main>
  );
}
