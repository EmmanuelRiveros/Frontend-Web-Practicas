import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const MEMBRESIAS = ['basica', 'plus', 'premium'];

export class ActualizarMiembroDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  correo?: string;

  @IsOptional()
  @IsIn(MEMBRESIAS)
  membresia?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
