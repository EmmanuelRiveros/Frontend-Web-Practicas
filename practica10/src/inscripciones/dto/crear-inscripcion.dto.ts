import { IsInt, Min } from 'class-validator';

// El ValidationPipe global reemplaza el chequeo manual que tenia el
// Controller (Number.isInteger a mano).
export class CrearInscripcionDto {
  @IsInt()
  @Min(1)
  horarioId: number;

  @IsInt()
  @Min(1)
  miembroId: number;
}
