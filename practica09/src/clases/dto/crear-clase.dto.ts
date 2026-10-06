import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// La misma validacion de antes, ahora declarativa. La corre el
// ValidationPipe global antes de que el Controller vea el body.
export class CrearClaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre: string;
}
