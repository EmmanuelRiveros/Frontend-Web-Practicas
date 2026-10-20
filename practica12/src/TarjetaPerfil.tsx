export interface TarjetaPerfilProps {
  nombre: string;
  carrera: string;
  semestre: number;
}

export function TarjetaPerfil({ nombre, carrera, semestre }: TarjetaPerfilProps) {
  const iniciales = nombre.trim().split(/\s+/).map(palabra => palabra[0]).join('').slice(0, 2);

  return (
    <article className="tarjeta">
      <div className="tarjeta__avatar" aria-hidden="true">{iniciales}</div>
      <h2 className="tarjeta__nombre">{nombre}</h2>
      <p className="tarjeta__carrera">{carrera}</p>
      <p className="tarjeta__semestre">Semestre: {semestre}</p>
    </article>
  );
}
