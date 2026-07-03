import { z } from 'zod';

const TAX_REGIMES = ['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI'] as const;

export const createCompanySchema = z.object({
  cnpj: z.string().min(11, 'Informe um CNPJ válido').max(18),
  razaoSocial: z.string().min(2, 'Informe a razão social').max(200),
  nomeFantasia: z.string().max(200).optional().or(z.literal('')),
  regimeTributario: z.enum(TAX_REGIMES).optional().or(z.literal('')),
  municipio: z.string().max(150).optional().or(z.literal('')),
  uf: z.string().length(2, 'Use a sigla com 2 letras').optional().or(z.literal('')),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

export const updateFiscalDataSchema = z.object({
  razaoSocial: z.string().min(2, 'Informe a razão social').max(200),
  nomeFantasia: z.string().max(200).optional().or(z.literal('')),
  regimeTributario: z.enum(TAX_REGIMES).optional().or(z.literal('')),
  inscricaoEstadual: z.string().max(30).optional().or(z.literal('')),
  inscricaoMunicipal: z.string().max(30).optional().or(z.literal('')),
  cnae: z.string().max(20).optional().or(z.literal('')),
  municipio: z.string().max(150).optional().or(z.literal('')),
  uf: z.string().length(2, 'Use a sigla com 2 letras').optional().or(z.literal('')),
});

export type UpdateFiscalDataFormValues = z.infer<typeof updateFiscalDataSchema>;

export const uploadCertificateSchema = z.object({
  password: z.string().min(1, 'Informe a senha do certificado'),
});

export type UploadCertificateFormValues = z.infer<typeof uploadCertificateSchema>;
