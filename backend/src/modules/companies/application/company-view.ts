import { Company, TaxRegime } from '@prisma/client';

export interface CertificateView {
  uploadedAt: Date;
  validoAte: Date | null;
}

export interface CompanyView {
  id: string;
  officeId: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  regimeTributario: TaxRegime | null;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  cnae: string | null;
  municipio: string | null;
  uf: string | null;
  logoUrl: string | null;
  fiscalSettings: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  certificate: CertificateView | null;
}

/**
 * Nunca inclui encryptedData/encryptedPassword/iv/authTag — só metadados do certificado.
 */
export function toCompanyView(
  company: Company,
  certificate: CertificateView | null = null,
): CompanyView {
  return {
    id: company.id,
    officeId: company.officeId,
    cnpj: company.cnpj,
    razaoSocial: company.razaoSocial,
    nomeFantasia: company.nomeFantasia,
    regimeTributario: company.regimeTributario,
    inscricaoEstadual: company.inscricaoEstadual,
    inscricaoMunicipal: company.inscricaoMunicipal,
    cnae: company.cnae,
    municipio: company.municipio,
    uf: company.uf,
    logoUrl: company.logoUrl,
    fiscalSettings: company.fiscalSettings,
    isActive: company.isActive,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    certificate,
  };
}
