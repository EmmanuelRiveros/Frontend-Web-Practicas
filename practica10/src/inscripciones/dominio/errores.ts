// De la Practica 9B (Paso 1.1): la clase base de todos los errores del gimnasio.
// abstract: nadie lanza un "ErrorDeDominio" a secas, solo sus hijas.
// El filtro hace @Catch(ErrorDeDominio) y con eso atrapa a las cuatro.
export abstract class ErrorDeDominio extends Error {}

// Antes decia "extends Error". Ahora las cuatro heredan de la base.

export class HorarioNoEncontradoError extends ErrorDeDominio {
  constructor(horarioId: number) {
    super(`No existe el horario ${horarioId}`);
  }
}

export class MiembroNoEncontradoError extends ErrorDeDominio {
  constructor(miembroId: number) {
    super(`No existe el miembro ${miembroId}`);
  }
}

export class CupoLlenoError extends ErrorDeDominio {
  constructor(horarioId: number, cupoMaximo: number) {
    super(`El horario ${horarioId} ya tiene ${cupoMaximo} inscripciones confirmadas`);
  }
}

export class InscripcionDuplicadaError extends ErrorDeDominio {
  constructor(horarioId: number, miembroId: number) {
    super(`El miembro ${miembroId} ya esta inscrito en el horario ${horarioId}`);
  }
}
