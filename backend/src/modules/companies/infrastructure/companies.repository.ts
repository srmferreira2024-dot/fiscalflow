import { Injectable } from '@nestjs/common';
import { Company, CompanyCertificate, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { CreateCompanyDto } from '../application/dto/create-company.dto';
import { UpdateCompanyDto } from '../application/dto/update-company.dto';

export interface CertificatePayload {
  encryptedData: Buffer;
  dataIv: Buffer;
  dataAuthTag: Buffer;
  encryptedPassword: Buffer;
  passwordIv: Buffer;
  passwordAuthTag: Buffer;
  validoAte?: Date | null;
}

/**
 * Toda leitura/escrita exige officeId explicitamente — não existe método que busque
 * uma Company (ou seu Certificado) só pelo id, para tornar estruturalmente impossível
 * vazar dado entre tenants.
 */
@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByOffice(officeId: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { officeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndOffice(id: string, officeId: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { id, officeId },
    });
  }

  create(officeId: string, dto: CreateCompanyDto): Promise<Company> {
    const { cnpj, ...rest } = dto;
    return this.prisma.company.create({
      data: {
        officeId,
        cnpj: cnpj.replace(/\D/g, ''),
        ...rest,
        fiscalSettings: rest.fiscalSettings as Prisma.InputJsonValue,
      },
    });
  }

  async updateByIdAndOffice(
    id: string,
    officeId: string,
    dto: UpdateCompanyDto,
  ): Promise<Company | null> {
    const { cnpj, ...rest } = dto;
    const result = await this.prisma.company.updateMany({
      where: { id, officeId },
      data: {
        ...rest,
        ...(cnpj ? { cnpj: cnpj.replace(/\D/g, '') } : {}),
        fiscalSettings: rest.fiscalSettings as Prisma.InputJsonValue,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findByIdAndOffice(id, officeId);
  }

  async deleteByIdAndOffice(id: string, officeId: string): Promise<boolean> {
    const result = await this.prisma.company.deleteMany({
      where: { id, officeId },
    });

    return result.count > 0;
  }

  async getCertificate(companyId: string, officeId: string): Promise<CompanyCertificate | null> {
    const company = await this.findByIdAndOffice(companyId, officeId);
    if (!company) {
      return null;
    }

    return this.prisma.companyCertificate.findUnique({ where: { companyId } });
  }

  async upsertCertificate(
    companyId: string,
    officeId: string,
    payload: CertificatePayload,
  ): Promise<CompanyCertificate | null> {
    const company = await this.findByIdAndOffice(companyId, officeId);
    if (!company) {
      return null;
    }

    return this.prisma.companyCertificate.upsert({
      where: { companyId },
      create: { companyId, ...payload },
      update: payload,
    });
  }

  async deleteCertificate(companyId: string, officeId: string): Promise<boolean> {
    const company = await this.findByIdAndOffice(companyId, officeId);
    if (!company) {
      return false;
    }

    await this.prisma.companyCertificate.delete({ where: { companyId } }).catch(() => null);

    return true;
  }
}
