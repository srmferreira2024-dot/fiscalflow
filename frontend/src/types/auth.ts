export type UserRole = 'ADMIN' | 'CONTADOR' | 'OPERADOR' | 'CLIENTE';

export interface AuthUser {
  id: string;
  officeId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export type TaxRegime = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI';

export interface CompanyCertificateMeta {
  uploadedAt: string;
  validoAte: string | null;
}

export interface Company {
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
  createdAt: string;
  updatedAt: string;
  certificate: CompanyCertificateMeta | null;
}

export type DocumentType = 'CPF' | 'CNPJ';

export interface Client {
  id: string;
  officeId: string;
  companyId: string;
  documentType: DocumentType;
  document: string;
  name: string;
  email: string | null;
  phone: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  officeId: string;
  companyId: string;
  code: string;
  name: string;
  ncm: string | null;
  cfop: string | null;
  cst: string | null;
  aliquotas: unknown;
  price: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  officeId: string;
  companyId: string;
  code: string;
  description: string;
  issAliquota: string | null;
  municipio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
