import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

/**
 * Creación de cuentas de personal por parte del Administrador.
 * A diferencia del registro público, aquí el rol es obligatorio y
 * restringido a roles operativos (no se crean clientes por esta vía).
 */
export class CreateStaffDto {
  @ApiProperty({ example: 'recepcion1@hotel.com' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Secret123*', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @ApiProperty({ example: 'Laura' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @ApiProperty({
    enum: [Role.RECEPTIONIST, Role.HOTEL_ADMIN],
    example: Role.RECEPTIONIST,
    description: 'Rol operativo de la cuenta de personal',
  })
  @IsEnum([Role.RECEPTIONIST, Role.HOTEL_ADMIN], {
    message: 'Solo se pueden crear cuentas RECEPTIONIST o HOTEL_ADMIN',
  })
  role: Role;

  @ApiProperty({ example: '+57 300 1234567', required: false })
  phone?: string;
}
