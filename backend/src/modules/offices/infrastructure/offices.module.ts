import { Module } from '@nestjs/common';
import { OfficesController } from './offices.controller';

@Module({
  controllers: [OfficesController],
})
export class OfficesModule {}
