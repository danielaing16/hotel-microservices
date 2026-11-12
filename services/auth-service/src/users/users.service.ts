import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('El correo ya se encuentra registrado');
    }

    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteGuests(): Promise<{ deletedCount: number; message: string }> {
    const guests = await this.userRepository.find({ where: { role: Role.GUEST } });
    const count = guests.length;
    if (count > 0) {
      await this.userRepository.remove(guests);
    }
    return {
      deletedCount: count,
      message: `${count} usuario(s) con rol GUEST eliminados exitosamente. Correos liberados.`,
    };
  }

  async deleteById(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (user.role === Role.HOTEL_ADMIN) {
      throw new BadRequestException('No se permite eliminar una cuenta con rol de Administrador');
    }
    await this.userRepository.remove(user);
    return { message: `Cuenta ${user.email} eliminada exitosamente` };
  }

  async setStatus(
    id: string,
    isActive: boolean,
  ): Promise<{ message: string; user: Pick<User, 'id' | 'email' | 'isActive'> }> {
    const user = await this.findById(id);
    user.isActive = isActive;
    const saved = await this.userRepository.save(user);
    return {
      message: `Cuenta ${saved.email} ${isActive ? 'activada' : 'desactivada'} exitosamente`,
      user: { id: saved.id, email: saved.email, isActive: saved.isActive },
    };
  }
}
