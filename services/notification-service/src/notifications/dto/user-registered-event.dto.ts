import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserRegisteredEventDto {
  @ApiProperty({ example: 'usr_892348a-bc', description: 'ID del usuario registrado' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'mauricio@hotel-dev.com', description: 'Correo del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Mauricio', description: 'Nombre de pila' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Gómez', description: 'Apellido' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'http://localhost', required: false })
  @IsOptional()
  @IsString()
  loginUrl?: string;

  @ApiProperty({ example: 'GUEST', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

