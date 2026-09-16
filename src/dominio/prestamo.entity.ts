/** Estados posibles de un prestamo. Union de literales, no enum. */
export type EstadoPrestamo = 'activo' | 'devuelto' | 'vencido' | 'extraviado';

export interface Prestamo {
  readonly folio: string;        // readonly: un folio no se reasigna nunca
  readonly creadoEn: Date;       // readonly: dato historico
  libroId: string;
  ejemplares: number[];          // un prestamo puede llevarse varios ejemplares
  socioId: string;
  estado: EstadoPrestamo;
  costoReposicion: number;       // dato INTERNO: no debe salir en la API
}

/** Genera un folio sencillo. En produccion seria un UUID. */
let consecutivo = 100;
export function nuevoFolio(): string {
  consecutivo += 1;
  return `P-${consecutivo}`;
}
