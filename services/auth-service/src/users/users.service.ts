import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
    if (guests.length > 0) {
      await this.userRepository.remove(guests);
    }
    return {
      deletedCount: guests.length,
      message: `${guests.length} usuarios con rol GUEST eliminados exitosamente. Correos liberados.`,
    };
  }

  async deleteById(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
    return { message: `Usuario ${user.email} eliminado exitosamente` };
  }
}
