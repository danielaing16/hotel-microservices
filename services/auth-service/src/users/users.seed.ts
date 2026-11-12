import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';

interface SeedAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

/**
 * Seed idempotente de cuentas del auth-service.
 *
 * Reglas de seguridad:
 *  - SOLO crea cuentas que no existen. Si el correo ya está registrado NO se toca
 *    (no se sobrescribe contraseña, rol ni estado). Así es seguro en cada arranque
 *    y en cada despliegue.
 *  - El administrador inicial se lee de variables de entorno (SEED_ADMIN_*),
 *    nunca de código, para no exponer credenciales reales en el repositorio.
 *  - Las cuentas demo (guest/recepcion/admin @hotel.com) solo se crean si
 *    SEED_DEMO_USERS=true. En producción debe ir en false.
 */
@Injectable()
export class UsersSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('UsersSeed');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const accounts: SeedAccount[] = [];

    // 1) Administrador inicial (credenciales desde .env)
    const adminEmail = this.config.get<string>('SEED_ADMIN_EMAIL', '').trim();
    const adminPassword = this.config.get<string>('SEED_ADMIN_PASSWORD', '');
    if (adminEmail && adminPassword) {
      accounts.push({
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        firstName: this.config.get<string>('SEED_ADMIN_FIRSTNAME', 'Administrador'),
        lastName: this.config.get<string>('SEED_ADMIN_LASTNAME', 'General'),
        role: Role.HOTEL_ADMIN,
      });
    } else if (adminEmail || adminPassword) {
      this.logger.warn('SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD deben definirse juntos; se omite el admin inicial.');
    }

    // 2) Cuentas demo (solo desarrollo)
    const seedDemo = this.config.get<string>('SEED_DEMO_USERS', 'false').toLowerCase() === 'true';
    if (seedDemo) {
      accounts.push(
        { email: 'guest@hotel.com', password: 'guest123', firstName: 'Carlos', lastName: 'Valderrama', phone: '+57 300 000 0001', role: Role.GUEST },
        { email: 'recepcion@hotel.com', password: 'recepcion123', firstName: 'Laura', lastName: 'Gómez', phone: '+57 300 000 0002', role: Role.RECEPTIONIST },
        { email: 'admin@hotel.com', password: 'admin123', firstName: 'Mauricio', lastName: 'Montoya', phone: '+57 300 000 0003', role: Role.HOTEL_ADMIN },
      );
    }

    if (accounts.length === 0) {
      this.logger.log('Seed sin cuentas configuradas (SEED_ADMIN_* vacío y SEED_DEMO_USERS=false).');
      return;
    }

    let created = 0;
    for (const acc of accounts) {
      try {
        const exists = await this.userRepository.findOne({ where: { email: acc.email } });
        if (exists) continue; // idempotente: nunca sobrescribe

        const hashed = await bcrypt.hash(acc.password, 10);
        await this.userRepository.save(
          this.userRepository.create({ ...acc, password: hashed, isActive: true }),
        );
        created++;
        this.logger.log(`Cuenta creada: ${acc.email} (${acc.role})`);
      } catch (err) {
        this.logger.error(`No se pudo crear ${acc.email}: ${(err as Error).message}`);
      }
    }

    this.logger.log(`Seed completado: ${created} creada(s), ${accounts.length - created} ya existían.`);
  }
}

