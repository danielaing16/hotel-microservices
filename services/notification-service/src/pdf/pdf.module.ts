import { Module } from '@nestjs/common';
import { VoucherGeneratorService } from './voucher-generator.service';

@Module({
  providers: [VoucherGeneratorService],
  exports: [VoucherGeneratorService],
})
export class PdfModule {}

