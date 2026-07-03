import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateProductDto } from '../application/dto/create-product.dto';
import { UpdateProductDto } from '../application/dto/update-product.dto';

/**
 * Toda leitura/escrita exige officeId + companyId explicitamente — não existe método
 * que busque um Product só pelo id, para tornar estruturalmente impossível vazar dado
 * entre tenants (ou entre empresas de um mesmo escritório).
 */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByCompany(companyId: string, officeId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { companyId, officeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndCompany(id: string, companyId: string, officeId: string): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { id, companyId, officeId },
    });
  }

  create(companyId: string, officeId: string, dto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...dto,
        aliquotas: dto.aliquotas as never,
        companyId,
        officeId,
      },
    });
  }

  async updateByIdAndCompany(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateProductDto,
  ): Promise<Product | null> {
    const result = await this.prisma.product.updateMany({
      where: { id, companyId, officeId },
      data: { ...dto, aliquotas: dto.aliquotas as never },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findByIdAndCompany(id, companyId, officeId);
  }

  async deleteByIdAndCompany(id: string, companyId: string, officeId: string): Promise<boolean> {
    const result = await this.prisma.product.deleteMany({
      where: { id, companyId, officeId },
    });

    return result.count > 0;
  }
}
