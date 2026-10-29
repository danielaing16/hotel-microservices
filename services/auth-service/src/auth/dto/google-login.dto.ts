import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'viajero.google@gmail.com',
    description: 'Correo electrónico verificado por Google',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({
    example: 'Antonio',
    description: 'Nombre de pila del usuario en Google',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    example: 'López',
    description: 'Apellidos del usuario en Google',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: '109283746591028374651',
    description: 'ID de usuario único en Google',
    required: false,
  })
  @IsString()
  @IsOptional()
  googleId?: string;
}

