import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Invoice, InvoiceStatus } from '@prisma/client';
import { InvoiceItemInput, InvoicesRepository } from '../../infrastructure/invoices.repository';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CreateInvoiceItemDto } from '../dto/create-invoice-item.dto';
import { CancelInvoiceDto } from '../dto/cancel-invoice.dto';
import { CompaniesService } from '../../../companies/application/services/companies.service';
import { ClientsService } from '../../../clients/application/services/clients.service';
import { ProductsService } from '../../../products/application/services/products.service';
import { ServiceItemsService } from '../../../service-items/application/services/service-items.service';
import {
  EmitirNotaOutput,
  INVOICE_PROVIDER,
  InvoiceProvider,
} from '../../domain/ports/invoice-provider.port';
import { InvoiceEmissionQueue } from '../../infrastructure/queues/invoice-emission.queue';

const PROVIDER_NAME = 'mock';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly companiesService: CompaniesService,
    private readonly clientsService: ClientsService,
    private readonly productsService: ProductsService,
    private readonly serviceItemsService: ServiceItemsService,
    @Inject(INVOICE_PROVIDER) private readonly invoiceProvider: InvoiceProvider,
    private readonly invoiceEmissionQueue: InvoiceEmissionQueue,
  ) {}

  async listForCompany(companyId: string, officeId: string) {
    await this.companiesService.getForOffice(companyId, officeId);
    return this.invoicesRepository.findAllByCompany(companyId, officeId);
  }

  async getForCompany(id: string, companyId: string, officeId: string) {
    await this.companiesService.getForOffice(companyId, officeId);

    const invoice = await this.invoicesRepository.findByIdAndCompany(id, companyId, officeId);
    if (!invoice) {
      throw new NotFoundException('Nota não encontrada');
    }

    return invoice;
  }

  async emitirNota(companyId: string, officeId: string, dto: CreateInvoiceDto): Promise<Invoice> {
    await this.companiesService.getForOffice(companyId, officeId);
    await this.clientsService.getForCompany(dto.clientId, companyId, officeId);

    const items = await this.buildInvoiceItems(companyId, officeId, dto.items);
    const valorTotal = items.reduce((total, item) => total + item.valorTotal, 0);

    const invoice = await this.invoicesRepository.create(companyId, officeId, {
      clientId: dto.clientId,
      valorTotal,
      providerName: PROVIDER_NAME,
      items,
      status: InvoiceStatus.PENDENTE_FILA,
    });

    await this.invoiceEmissionQueue.addEmissionJob({
      invoiceId: invoice.id,
      companyId,
      officeId,
      clientId: dto.clientId,
      attemptNumber: 1,
    });

    return invoice;
  }

  async reemitirNota(id: string, companyId: string, officeId: string): Promise<Invoice> {
    const invoice = await this.getForCompany(id, companyId, officeId);
    await this.invoiceEmissionQueue.addEmissionJob({
      invoiceId: id,
      companyId,
      officeId,
      clientId: invoice.clientId,
      attemptNumber: 1,
    });
    return invoice;
  }

  async cancelarNota(
    id: string,
    companyId: string,
    officeId: string,
    dto: CancelInvoiceDto,
  ): Promise<Invoice> {
    await this.getForCompany(id, companyId, officeId);

    const result = await this.invoiceProvider.cancelarNota({
      companyId,
      notaId: id,
      motivo: dto.motivo,
    });

    const updated = await this.invoicesRepository.updateStatusByIdAndCompany(
      id,
      companyId,
      officeId,
      {
        status: result.status === 'CANCELADA' ? InvoiceStatus.CANCELADA : InvoiceStatus.REJEITADA,
        motivo: dto.motivo,
      },
    );

    if (!updated) {
      throw new NotFoundException('Nota não encontrada');
    }

    return updated;
  }

  async baixarXML(id: string, companyId: string, officeId: string): Promise<Buffer> {
    await this.getForCompany(id, companyId, officeId);
    return this.invoiceProvider.baixarXML({ companyId, notaId: id });
  }

  async baixarPDF(id: string, companyId: string, officeId: string): Promise<Buffer> {
    await this.getForCompany(id, companyId, officeId);
    return this.invoiceProvider.baixarPDF({ companyId, notaId: id });
  }

  async emitirViaProvider(
    invoiceId: string,
    companyId: string,
    officeId: string,
    clientId: string,
  ): Promise<EmitirNotaOutput> {
    const invoice = await this.invoicesRepository.findByIdAndCompany(
      invoiceId,
      companyId,
      officeId,
    );
    if (!invoice) {
      throw new NotFoundException('Nota não encontrada');
    }

    const client = await this.clientsService.getForCompany(clientId, companyId, officeId);

    const result = await this.invoiceProvider.emitirNota({
      companyId,
      clienteDocumento: client.document,
      clienteNome: client.name,
      descricaoServico: `Nota ${invoice.id}`,
      valor: Number(invoice.valorTotal),
      notaId: invoice.id,
    });

    await this.invoicesRepository.updateStatusByIdAndCompany(
      invoice.id,
      companyId,
      officeId,
      {
        status:
          result.status === 'AUTORIZADA'
            ? InvoiceStatus.AUTORIZADA
            : result.status === 'REJEITADA'
              ? InvoiceStatus.REJEITADA
              : InvoiceStatus.PROCESSANDO,
        numero: result.numero,
        protocolo: result.protocolo ?? null,
        dataEmissao: result.status === 'AUTORIZADA' ? new Date() : null,
      },
    );

    return result;
  }

  async updateStatusUnsafe(
    invoiceId: string,
    newStatus: string,
    extras?: { lastErrorMessage?: string },
  ): Promise<void> {
    await this.invoicesRepository.updateStatusUnsafe(invoiceId, newStatus, extras);
  }

  private async buildInvoiceItems(
    companyId: string,
    officeId: string,
    itemDtos: CreateInvoiceItemDto[],
  ): Promise<InvoiceItemInput[]> {
    return Promise.all(
      itemDtos.map(async (itemDto) => {
        const hasProduct = Boolean(itemDto.productId);
        const hasService = Boolean(itemDto.serviceItemId);

        if (hasProduct === hasService) {
          throw new BadRequestException(
            'Cada item deve referenciar exatamente um entre productId e serviceItemId',
          );
        }

        // Sempre busca o Produto/Serviço — é o que garante que o id pertence a esta
        // empresa antes de aceitar o item (mesmo quando description já veio preenchida).
        let description = itemDto.description;
        if (hasProduct) {
          const product = await this.productsService.getForCompany(
            itemDto.productId!,
            companyId,
            officeId,
          );
          description ??= product.name;
        } else {
          const serviceItem = await this.serviceItemsService.getForCompany(
            itemDto.serviceItemId!,
            companyId,
            officeId,
          );
          description ??= serviceItem.description;
        }

        const valorTotal = Number((itemDto.quantidade * itemDto.valorUnitario).toFixed(2));

        return {
          description,
          quantidade: itemDto.quantidade,
          valorUnitario: itemDto.valorUnitario,
          valorTotal,
          productId: itemDto.productId,
          serviceItemId: itemDto.serviceItemId,
        };
      }),
    );
  }
}
