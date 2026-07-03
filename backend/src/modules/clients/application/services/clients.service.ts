import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, DocumentType, Prisma } from '@prisma/client';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { CompaniesService } from '../../../companies/application/services/companies.service';
import { Cpf } from '../../../../common/value-objects/cpf.vo';
import { Cnpj } from '../../../../common/value-objects/cnpj.vo';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly companiesService: CompaniesService,
  ) {}

  async listForCompany(companyId: string, officeId: string): Promise<Client[]> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);
    return this.clientsRepository.findAllByCompany(companyId, officeId);
  }

  async getForCompany(id: string, companyId: string, officeId: string): Promise<Client> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const client = await this.clientsRepository.findByIdAndCompany(id, companyId, officeId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async create(companyId: string, officeId: string, dto: CreateClientDto): Promise<Client> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);
    this.assertValidDocument(dto.documentType, dto.document);

    try {
      return await this.clientsRepository.create(companyId, officeId, dto);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictException('Já existe um cliente com este documento nesta empresa');
      }
      throw error;
    }
  }

  async update(
    id: string,
    companyId: string,
    officeId: string,
    dto: UpdateClientDto,
  ): Promise<Client> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    if (dto.document && dto.documentType) {
      this.assertValidDocument(dto.documentType, dto.document);
    }

    const updated = await this.clientsRepository.updateByIdAndCompany(id, companyId, officeId, dto);
    if (!updated) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return updated;
  }

  async remove(id: string, companyId: string, officeId: string): Promise<void> {
    await this.assertCompanyBelongsToOffice(companyId, officeId);

    const deleted = await this.clientsRepository.deleteByIdAndCompany(id, companyId, officeId);
    if (!deleted) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  private async assertCompanyBelongsToOffice(companyId: string, officeId: string): Promise<void> {
    await this.companiesService.getForOffice(companyId, officeId);
  }

  private assertValidDocument(documentType: DocumentType, rawDocument: string): void {
    try {
      if (documentType === DocumentType.CPF) {
        Cpf.create(rawDocument);
      } else {
        Cnpj.create(rawDocument);
      }
    } catch {
      throw new BadRequestException(`${documentType} inválido`);
    }
  }
}
