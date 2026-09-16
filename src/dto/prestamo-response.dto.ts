//  Este es lo que el sistema DEVUELVE. Fijense en lo que NO lleva:
//  `costoReposicion` se queda dentro. Ese es el punto del patron.
//
//  PrestamoResponseDto solo expone los datos publicos y la funcion de
//  abajo convierte la entidad a ese formato.


import type { Prestamo, EstadoPrestamo } from '../dominio/prestamo.entity.js';

export interface PrestamoResponseDto {
  folio: string;
  libroId: string;
  ejemplares: number[];
  socioId: string;
  estado: EstadoPrestamo;
  creadoEn: string;
}

export function aResponseDto(p: Prestamo): PrestamoResponseDto {
  return {
    folio: p.folio,
    libroId: p.libroId,
    ejemplares: [...p.ejemplares],
    socioId: p.socioId,
    estado: p.estado,
    creadoEn: p.creadoEn.toISOString(),
  };
}
