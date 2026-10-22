interface EncabezadoProps {
  piezas: number;
}

export function Encabezado({ piezas }: EncabezadoProps) {
    return (
        <header className="encabezado">
            <div className="encabezado__marca">
                <img src="/img/logo.svg" alt="" height="32" />
                Tienda
            </div>
            <span className="encabezado__carrito" aria-live="polite">
                Carrito: <strong>{piezas}</strong>
            </span>
        </header>
    )
}

