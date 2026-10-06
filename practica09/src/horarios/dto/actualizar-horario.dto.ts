import { IsInt, IsOptional, IsString, Matches, Min, MaxLength } from 'class-validator';

export class ActualizarHorarioDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  claseId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dia?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cupoMaximo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  entrenador?: string;
}
