import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarClaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  nombre?: string;
}
