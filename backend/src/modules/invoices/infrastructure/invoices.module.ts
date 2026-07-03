import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { InvoicesController } from './invoices.controller';
import { QueueStatsController } from './controllers/queue-stats.controller';
import { InvoicesRepository } from './invoices.repository';
import { InvoicesService } from '../application/services/invoices.service';
import { MockInvoiceProviderAdapter } from './adapters/mock-invoice-provider.adapter';
import { INVOICE_PROVIDER } from '../domain/ports/invoice-provider.port';
import { InvoiceEmissionQueue } from './queues/invoice-emission.queue';
import { InvoiceEmissionProcessor } from './processors/invoice-emission.processor';
import { CompaniesModule } from '../../companies/infrastructure/companies.module';
import { ClientsModule } from '../../clients/infrastructure/clients.module';
import { ProductsModule } from '../../products/infrastructure/products.module';
import { ServiceItemsModule } from '../../service-items/infrastructure/service-items.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'invoice-emission' }),
    CompaniesModule,
    ClientsModule,
    ProductsModule,
    ServiceItemsModule,
  ],
  controllers: [InvoicesController, QueueStatsController],
  providers: [
    InvoicesRepository,
    InvoicesService,
    MockInvoiceProviderAdapter,
    InvoiceEmissionQueue,
    InvoiceEmissionProcessor,
    // Único ponto de troca quando um Adapter fiscal real existir — nunca em InvoicesService.
    { provide: INVOICE_PROVIDER, useExisting: MockInvoiceProviderAdapter },
  ],
})
export class InvoicesModule {}
