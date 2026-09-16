import type { CrearPrestamoRequestDto } from '../../contratos/prestamo.dto.js';

export class ValidacionError extends Error {
  constructor(public readonly detalles: string[]) {
    super('La peticion no cumple el contrato');
    this.name = 'ValidacionError';
  }
}

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Valida datos que llegan desde HTTP. En este punto todavia son unknown,
 * asi que aqui se revisa lo que TypeScript no puede comprobar en runtime.
 */
export function validarCrearPrestamo(cuerpo: unknown): CrearPrestamoRequestDto {
  if (!esObjetoPlano(cuerpo)) {
    throw new ValidacionError(['El cuerpo debe ser un objeto JSON.']);
  }

  const detalles: string[] = [];
  const libroId = cuerpo.libroId;
  const socioId = cuerpo.socioId;
  const ejemplares = cuerpo.ejemplares;
  const libroIdLimpio = typeof libroId === 'string' ? libroId.trim() : '';
  const socioIdLimpio = typeof socioId === 'string' ? socioId.trim() : '';
  let ejemplaresValidos: number[] = [];

  if (libroIdLimpio === '') {
    detalles.push('libroId debe ser un texto no vacio.');
  }

  if (socioIdLimpio === '') {
    detalles.push('socioId debe ser un texto no vacio.');
  }

  if (!Array.isArray(ejemplares)) {
    detalles.push('ejemplares debe ser un arreglo de numeros.');
  } else {
    if (ejemplares.length === 0) {
      detalles.push('ejemplares debe incluir al menos un ejemplar.');
    }

    ejemplares.forEach((ejemplar, indice) => {
      if (!Number.isSafeInteger(ejemplar) || ejemplar <= 0) {
        detalles.push(`ejemplares[${indice}] debe ser un entero positivo.`);
      }
    });

    if (detalles.length === 0) {
      ejemplaresValidos = [...ejemplares] as number[];
    }
  }

  if (detalles.length > 0) {
    throw new ValidacionError(detalles);
  }

  return {
    libroId: libroIdLimpio,
    socioId: socioIdLimpio,
    ejemplares: ejemplaresValidos,
  };
}
