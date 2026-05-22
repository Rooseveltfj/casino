import { Module } from '@nestjs/common';
import { PspController } from './psp.controller';
import { PspService } from './psp.service';

@Module({
  controllers: [PspController],
  providers: [PspService],
  exports: [PspService],
})
export class PspModule {}
