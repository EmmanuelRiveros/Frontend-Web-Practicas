// =====================================================================
//  CHECKPOINT 4  —  el Service: aqui y SOLO aqui viven las reglas
// =====================================================================
//  Regla de negocio de esta practica:
//    "no se puede prestar un ejemplar que ya esta prestado"
//
//  Solucion:
//    1. Recibir el repositorio POR CONSTRUCTOR, tipado con la
//       INTERFAZ `PrestamoRepository`, nunca con la clase concreta.
//    2. Metodo `crear(dto: CrearPrestamoDto): Promise<Prestamo>`:
//         a. pedir al repositorio los prestamos de ese libro
//         b. juntar los ejemplares que ya estan fuera
//            (pista: `.filter(...)` por estado + `.flatMap(...)`)
//         c. si alguno de los solicitados choca, lanzar
//            `new EjemplarPrestadoError(numero)`
//         d. si no, guardar el prestamo nuevo y devolverlo
//    3. Metodo `listarPorLibro(libroId)` que solo delega al repositorio.
//
//  LA PRUEBA DE FUEGO de este archivo:
//    ¿aparece la palabra `InMemory` en algun import? Si aparece, el
//    Service quedo acoplado a la infraestructura y el patron se rompio.
// =====================================================================

import type { PrestamoRepository } from '../dominio/prestamo.repository.js';
import type { Prestamo } from '../dominio/prestamo.entity.js';
import { nuevoFolio } from '../dominio/prestamo.entity.js';
import type { CrearPrestamoDto } from '../dto/crear-prestamo.dto.js';
import { EjemplarPrestadoError } from '../errores/ejemplar-prestado.error.js';

export class PrestamoService {
  constructor(private readonly repositorio: PrestamoRepository) {}

  async crear(dto: CrearPrestamoDto): Promise<Prestamo> {
    const prestamosDelLibro = await this.repositorio.findByLibro(dto.libroId);
    const ejemplaresFuera = prestamosDelLibro
      .filter((prestamo) => prestamo.estado !== 'devuelto')
      .flatMap((prestamo) => prestamo.ejemplares);

    const ejemplarRepetido = dto.ejemplares.find((ejemplar) =>
      ejemplaresFuera.includes(ejemplar),
    );

    if (ejemplarRepetido !== undefined) {
      throw new EjemplarPrestadoError(ejemplarRepetido);
    }

    const prestamo: Prestamo = {
      ...dto,
      folio: nuevoFolio(),
      creadoEn: new Date(),
      estado: 'activo',
      costoReposicion: 0,
    };

    return this.repositorio.save(prestamo);
  }

  async listarPorLibro(libroId: string): Promise<Prestamo[]> {
    return this.repositorio.findByLibro(libroId);
  }
}
