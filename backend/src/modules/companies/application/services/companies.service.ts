import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CompaniesRepository } from '../../infrastructure/companies.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { UploadCertificateDto } from '../dto/upload-certificate.dto';
import { Cnpj } from '../../../../common/value-objects/cnpj.vo';
import { CertificateEncryptionService } from '../../../../infra/security/certificate-encryption.service';
import { CompanyView, toCompanyView } from '../company-view';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly certificateEncryption: CertificateEncryptionService,
  ) {}

  async listForOffice(officeId: string): Promise<CompanyView[]> {
    const companies = await this.companiesRepository.findAllByOffice(officeId);
    return companies.map((company) => toCompanyView(company));
  }

  async getForOffice(id: string, officeId: string): Promise<CompanyView> {
    const company = await this.companiesRepository.findByIdAndOffice(id, officeId);

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const certificate = await this.companiesRepository.getCertificate(id, officeId);
    return toCompanyView(
      company,
      certificate ? { uploadedAt: certificate.uploadedAt, validoAte: certificate.validoAte } : null,
    );
  }

  async create(officeId: string, dto: CreateCompanyDto): Promise<CompanyView> {
    this.assertValidCnpj(dto.cnpj);

    try {
      const company = await this.companiesRepository.create(officeId, dto);
      return toCompanyView(company);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictException('Já existe uma empresa com este CNPJ neste escritório');
      }
      throw error;
    }
  }

  async update(id: string, officeId: string, dto: UpdateCompanyDto): Promise<CompanyView> {
    if (dto.cnpj) {
      this.assertValidCnpj(dto.cnpj);
    }

    const updated = await this.companiesRepository.updateByIdAndOffice(id, officeId, dto);

    if (!updated) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return toCompanyView(updated);
  }

  async remove(id: string, officeId: string): Promise<void> {
    const deleted = await this.companiesRepository.deleteByIdAndOffice(id, officeId);

    if (!deleted) {
      throw new NotFoundException('Empresa não encontrada');
    }
  }

  async uploadCertificate(
    companyId: string,
    officeId: string,
    dto: UploadCertificateDto,
  ): Promise<CompanyView> {
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(dto.fileBase64, 'base64');
    } catch {
      throw new BadRequestException('Conteúdo do certificado em base64 inválido');
    }

    if (fileBuffer.length === 0) {
      throw new BadRequestException('Conteúdo do certificado em base64 inválido');
    }

    const encryptedFile = this.certificateEncryption.encrypt(fileBuffer);
    const encryptedPassword = this.certificateEncryption.encrypt(Buffer.from(dto.password));

    const certificate = await this.companiesRepository.upsertCertificate(companyId, officeId, {
      encryptedData: encryptedFile.data,
      dataIv: encryptedFile.iv,
      dataAuthTag: encryptedFile.authTag,
      encryptedPassword: encryptedPassword.data,
      passwordIv: encryptedPassword.iv,
      passwordAuthTag: encryptedPassword.authTag,
    });

    if (!certificate) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return this.getForOffice(companyId, officeId);
  }

  async removeCertificate(companyId: string, officeId: string): Promise<void> {
    const deleted = await this.companiesRepository.deleteCertificate(companyId, officeId);

    if (!deleted) {
      throw new NotFoundException('Empresa não encontrada');
    }
  }

  private assertValidCnpj(rawCnpj: string): void {
    try {
      Cnpj.create(rawCnpj);
    } catch {
      throw new BadRequestException('CNPJ inválido');
    }
  }
}
