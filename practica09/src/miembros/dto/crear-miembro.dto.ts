import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const MEMBRESIAS = ['basica', 'plus', 'premium'];

export class CrearMiembroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @IsEmail()
  @MaxLength(160)
  correo: string;

  @IsIn(MEMBRESIAS)
  membresia: string;
}
