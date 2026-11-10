// <MensajeError> — RECURSO: el de la Práctica 14.
interface MensajeErrorProps {
  mensaje: string;
  onReintentar: () => void;
}

export function MensajeError({ mensaje, onReintentar }: MensajeErrorProps) {
  return (
    <div className="error">
      <p>{mensaje}</p>
      <button className="boton" onClick={onReintentar}>Reintentar</button>
    </div>
  );
}
