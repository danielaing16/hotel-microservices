import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailModule } from '../mail/mail.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [MailModule, PdfModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

