import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from '../application/services/products.service';
import { CompaniesModule } from '../../companies/infrastructure/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
