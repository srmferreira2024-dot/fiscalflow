import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateClientDto } from '../application/dto/create-client.dto';
import { UpdateClientDto } from '../application/dto/update-client.dto';

/**
 * Toda leitura/escrita exige officeId + companyId explicitamente — não existe método
 * que busque um Client só pelo id, para tornar estruturalmente impossível vazar dado
 * entre tenants (ou entre empresas de um mesmo escritório).
 */
@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByCompany(companyId: string, officeId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { companyId, officeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndCompany(id: string, companyId: string, officeId: string): Promise<Client | null> {
    return this.prisma.client.findFirst({
      where: { id, companyId, officeId },
    });
  }

  create(companyId: string, officeId: string, dto: CreateClientDto): Promise<Client> {
    return this.prisma.client.create({
      data: {
        ...dto,
        document: dto.document.replace(/\D/g, ''),
        companyId,
        officeId,
      },
    });
  }

  async updateByIdAndCompany(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateClientDto,
  ): Promise<Client | null> {
    const { document, ...rest } = dto;
    const result = await this.prisma.client.updateMany({
      where: { id, companyId, officeId },
      data: {
        ...rest,
        ...(document ? { document: document.replace(/\D/g, '') } : {}),
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findByIdAndCompany(id, companyId, officeId);
  }

  async deleteByIdAndCompany(id: string, companyId: string, officeId: string): Promise<boolean> {
    const result = await this.prisma.client.deleteMany({
      where: { id, companyId, officeId },
    });

    return result.count > 0;
  }
}
