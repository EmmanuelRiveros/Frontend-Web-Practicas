import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// El registro público no recibe identidad ni privilegios elegidos por el cliente.
export class RegistroDto {
  @IsEmail({}, { message: 'el correo no tiene un formato valido' })
  @MaxLength(160)
  correo: string;

  @IsString()
  @MinLength(8, { message: 'la contrasena debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'el correo no tiene un formato valido' })
  @MaxLength(160)
  correo: string;

  @IsString()
  @MinLength(1, { message: 'la contrasena es obligatoria' })
  @MaxLength(72)
  password: string;
}

export class TokenDto {
  access_token: string;
  token_type: string;
  expires_in: number;
}
