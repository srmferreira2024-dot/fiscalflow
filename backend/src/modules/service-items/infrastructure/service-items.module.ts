import { Module } from '@nestjs/common';
import { ServiceItemsController } from './service-items.controller';
import { ServiceItemsRepository } from './service-items.repository';
import { ServiceItemsService } from '../application/services/service-items.service';
import { CompaniesModule } from '../../companies/infrastructure/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [ServiceItemsController],
  providers: [ServiceItemsRepository, ServiceItemsService],
  exports: [ServiceItemsService],
})
export class ServiceItemsModule {}
