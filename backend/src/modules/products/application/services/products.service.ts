import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { ProductsRepository } from '../../infrastructure/products.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { CompaniesService } from '../../../companies/application/services/companies.service';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  async listForCompany(companyId: string, officeId: string): Promise<Product[]> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);
    return this.productsRepository.findAllByCompany(companyId, officeId);
  }

  async getForCompany(id: string, companyId: string, officeId: string): Promise<Product> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const product = await this.productsRepository.findByIdAndCompany(id, companyId, officeId);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async create(companyId: string, officeId: string, dto: CreateProductDto): Promise<Product> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    try {
      return await this.productsRepository.create(companyId, officeId, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictException('Já existe um produto com este código nesta empresa');
      }
      throw error;
    }
  }

  async update(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const updated = await this.productsRepository.updateByIdAndCompany(
      id,
      companyId,
      officeId,
      dto,
    );
    if (!updated) {
      throw new NotFoundException('Produto não encontrado');
    }

    return updated;
  }

  async remove(id: string, companyId: string, officeId: string): Promise<void> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const deleted = await this.productsRepository.deleteByIdAndCompany(id, companyId, officeId);
    if (!deleted) {
      throw new NotFoundException('Produto não encontrado');
    }
  }

  private async assertCompanyBelongsToOffice(companyId: string, officeId: string): Promise<void> {
    await this.companiesService.getForOffice(companyId, officeId);
  }
}
