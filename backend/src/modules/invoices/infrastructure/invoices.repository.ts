import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';

export interface InvoiceItemInput {
  description: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  productId?: string;
  serviceItemId?: string;
}

export interface CreateInvoiceInput {
  clientId: string;
  valorTotal: number;
  providerName: string;
  items: InvoiceItemInput[];
  status?: InvoiceStatus;
}

export interface UpdateInvoiceStatusInput {
  status: InvoiceStatus;
  numero?: string | null;
  protocolo?: string | null;
  motivo?: string | null;
  dataEmissao?: Date | null;
}

const includeItems = { items: true } satisfies Prisma.InvoiceInclude;

/**
 * Toda leitura/escrita exige officeId + companyId explicitamente — não existe método
 * que busque uma Invoice só pelo id, para tornar estruturalmente impossível vazar dado
 * entre tenants (ou entre empresas de um mesmo escritório).
 */
@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByCompany(companyId: string, officeId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId, officeId },
      orderBy: { createdAt: 'desc' },
      include: includeItems,
    });
  }

  findByIdAndCompany(id: string, companyId: string, officeId: string) {
    return this.prisma.invoice.findFirst({
      where: { id, companyId, officeId },
      include: includeItems,
    });
  }

  create(companyId: string, officeId: string, input: CreateInvoiceInput) {
    return this.prisma.invoice.create({
      data: {
        companyId,
        officeId,
        clientId: input.clientId,
        valorTotal: input.valorTotal,
        providerName: input.providerName,
        status: input.status ?? InvoiceStatus.RASCUNHO,
        items: {
          create: input.items.map((item) => ({
            description: item.description,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            productId: item.productId,
            serviceItemId: item.serviceItemId,
          })),
        },
      },
      include: includeItems,
    });
  }

  async updateStatusByIdAndCompany(
    id: string,
    companyId: string,
    officeId: string,
    input: UpdateInvoiceStatusInput,
  ): Promise<Invoice | null> {
    const result = await this.prisma.invoice.updateMany({
      where: { id, companyId, officeId },
      data: input,
    });

    if (result.count === 0) {
      return null;
    }

    return this.prisma.invoice.findFirst({ where: { id, companyId, officeId } });
  }

  async updateStatusUnsafe(
    invoiceId: string,
    newStatus: string,
    extras?: { lastErrorMessage?: string },
  ): Promise<void> {
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus as InvoiceStatus,
        lastErrorMessage: extras?.lastErrorMessage,
        updatedAt: new Date(),
      },
    });
  }
}
