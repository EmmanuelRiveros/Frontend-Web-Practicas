interface FiltrosProps {
    categorias: string[];
    activa: string;
    onCambiar: (categoria: string) => void;
}

export function Filtros({ categorias, activa, onCambiar }: FiltrosProps) {
    return (
        <nav className="filtros" aria-label="Filtrar por categoría">
            { categorias.map(c => (
                <button
                    key={c}
                    type="button"
                    aria-pressed={c === activa}
                    className={c === activa ? "filtros__boton filtros__boton--activo" : "filtros__boton"}
                    onClick={() => onCambiar(c)}
                >
                    {c}
                </button>
            )) }
        </nav>
    )

}

