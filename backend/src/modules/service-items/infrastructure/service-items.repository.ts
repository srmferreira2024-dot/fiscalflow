import { Injectable } from '@nestjs/common';
import { ServiceItem } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateServiceItemDto } from '../application/dto/create-service-item.dto';
import { UpdateServiceItemDto } from '../application/dto/update-service-item.dto';

/**
 * Toda leitura/escrita exige officeId + companyId explicitamente — não existe método
 * que busque um ServiceItem só pelo id, para tornar estruturalmente impossível vazar
 * dado entre tenants (ou entre empresas de um mesmo escritório).
 */
@Injectable()
export class ServiceItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByCompany(companyId: string, officeId: string): Promise<ServiceItem[]> {
    return this.prisma.serviceItem.findMany({
      where: { companyId, officeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndCompany(id: string, companyId: string, officeId: string): Promise<ServiceItem | null> {
    return this.prisma.serviceItem.findFirst({
      where: { id, companyId, officeId },
    });
  }

  create(companyId: string, officeId: string, dto: CreateServiceItemDto): Promise<ServiceItem> {
    return this.prisma.serviceItem.create({
      data: { ...dto, companyId, officeId },
    });
  }

  async updateByIdAndCompany(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateServiceItemDto,
  ): Promise<ServiceItem | null> {
    const result = await this.prisma.serviceItem.updateMany({
      where: { id, companyId, officeId },
      data: dto,
    });

    if (result.count === 0) {
      return null;
    }

    return this.findByIdAndCompany(id, companyId, officeId);
  }

  async deleteByIdAndCompany(id: string, companyId: string, officeId: string): Promise<boolean> {
    const result = await this.prisma.serviceItem.deleteMany({
      where: { id, companyId, officeId },
    });

    return result.count > 0;
  }
}
