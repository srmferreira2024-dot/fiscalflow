import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceItem, Prisma } from '@prisma/client';
import { ServiceItemsRepository } from '../../infrastructure/service-items.repository';
import { CreateServiceItemDto } from '../dto/create-service-item.dto';
import { UpdateServiceItemDto } from '../dto/update-service-item.dto';
import { CompaniesService } from '../../../companies/application/services/companies.service';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

@Injectable()
export class ServiceItemsService {
  constructor(
    private readonly serviceItemsRepository: ServiceItemsRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  async listForCompany(companyId: string, officeId: string): Promise<ServiceItem[]> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);
    return this.serviceItemsRepository.findAllByCompany(companyId, officeId);
  }

  async getForCompany(id: string, companyId: string, officeId: string): Promise<ServiceItem> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const serviceItem = await this.serviceItemsRepository.findByIdAndCompany(
      id,
      companyId,
      officeId,
    );
    if (!serviceItem) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return serviceItem;
  }

  async create(
    companyId: string,
    officeId: string,
    dto: CreateServiceItemDto,
  ): Promise<ServiceItem> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    try {
      return await this.serviceItemsRepository.create(companyId, officeId, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictException('Já existe um serviço com este código nesta empresa');
      }
      throw error;
    }
  }

  async update(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateServiceItemDto,
  ): Promise<ServiceItem> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const updated = await this.serviceItemsRepository.updateByIdAndCompany(
      id,
      companyId,
      officeId,
      dto,
    );
    if (!updated) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return updated;
  }

  async remove(id: string, companyId: string, officeId: string): Promise<void> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const deleted = await this.serviceItemsRepository.deleteByIdAndCompany(id, companyId, officeId);
    if (!deleted) {
      throw new NotFoundException('Serviço não encontrado');
    }
  }

  private async assertCompanyBelongsToOffice(companyId: string, officeId: string): Promise<void> {
    await this.companiesService.getForOffice(companyId, officeId);
  }
}
