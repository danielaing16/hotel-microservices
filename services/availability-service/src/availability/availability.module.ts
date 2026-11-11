import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { RoomReservation } from './entities/room-reservation.entity';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([RoomReservation])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, RolesGuard],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}

