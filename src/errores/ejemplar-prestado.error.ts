// =====================================================================
//  errores/ejemplar-prestado.error.ts   —   SE ENTREGA HECHO
// =====================================================================
//  Un error de DOMINIO, no de HTTP.
// =====================================================================

export class EjemplarPrestadoError extends Error {
  constructor(public readonly ejemplar: number) {
    super(`El ejemplar ${ejemplar} ya esta prestado`);
    this.name = 'EjemplarPrestadoError';
  }
}
