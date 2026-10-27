import { pesos } from './datos';

interface PiePaginaProps {
  piezas: number;
  total: number;
}

export function PiePagina({ piezas, total }: PiePaginaProps) {
    return (
        <footer className="pie" aria-label="Resumen del carrito" aria-live="polite">
            <span className="pie__resumen">{piezas === 0 ? 'Tu carrito está vacío' : `${piezas} pieza(s) en el carrito`}</span>
            <span className="pie__total">{pesos.format(total)}</span>
        </footer>
    )
}

