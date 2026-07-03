import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsRepository } from './clients.repository';
import { ClientsService } from '../application/services/clients.service';
import { CompaniesModule } from '../../companies/infrastructure/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [ClientsController],
  providers: [ClientsRepository, ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
