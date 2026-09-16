import type { EstadoPrestamo, Prestamo } from '../src/dominio/prestamo.entity.js';

/** Datos publicos que la API devuelve sobre un prestamo. */
export interface PrestamoResponseDto {
  folio: string;
  libroId: string;
  ejemplares: number[];
  socioId: string;
  estado: EstadoPrestamo;
  creadoEn: string;
}

/** Datos que un cliente puede enviar para crear un prestamo. */
export interface CrearPrestamoRequestDto {
  libroId: string;
  socioId: string;
  ejemplares: number[];
}

/** Forma comun de los rechazos que responde la API. */
export interface ErrorResponseDto {
  error: string;
  detalles?: string[];
}

/** Convierte la entidad de dominio al contrato publico de HTTP. */
export function aPrestamoResponseDto(prestamo: Prestamo): PrestamoResponseDto {
  return {
    folio: prestamo.folio,
    libroId: prestamo.libroId,
    ejemplares: [...prestamo.ejemplares],
    socioId: prestamo.socioId,
    estado: prestamo.estado,
    creadoEn: prestamo.creadoEn.toISOString(),
  };
}
