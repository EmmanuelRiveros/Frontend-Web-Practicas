import type { ReactNode } from "react";

interface LayoutProps {
    encabezado: ReactNode;
    pie: ReactNode;
    children: ReactNode;
}

export function Layout({ encabezado, pie, children }: LayoutProps) {
    return (
        <div className="tienda">
            { encabezado }
            <main className="contenido">{ children }</main>
            { pie }
        </div>
    )
}