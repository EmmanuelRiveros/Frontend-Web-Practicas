import { IsInt, IsNotEmpty, IsString, Matches, Min, MaxLength } from 'class-validator';

export class CrearHorarioDto {
  @IsInt()
  @Min(1)
  claseId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dia: string;

  // HH:MM de 24 horas.
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio: string;

  @IsInt()
  @Min(1)
  cupoMaximo: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  entrenador: string;
}
