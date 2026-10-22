// Caso negativo aislado: TypeScript debe rechazar void como manejador.
interface ProductoEjemplo { id: string; nombre: string }
interface Props { producto: ProductoEjemplo; onAgregar: (producto: ProductoEjemplo) => void }
export function TarjetaIncorrecta({ producto, onAgregar }: Props) {
  return <button onClick={onAgregar(producto)}>Agregar</button>;
}
