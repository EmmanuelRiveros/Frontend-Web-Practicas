interface Props { mensaje: string; onReintentar: () => void }
export function ErrorCatalogo({ mensaje, onReintentar }: Props) {
  return <section className="error" role="alert"><p>{mensaje}</p><button type="button" onClick={onReintentar}>Reintentar</button></section>;
}
