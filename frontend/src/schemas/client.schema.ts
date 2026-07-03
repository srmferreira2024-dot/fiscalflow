import { z } from 'zod';

export const clientSchema = z.object({
  documentType: z.enum(['CPF', 'CNPJ']),
  document: z.string().min(11, 'Informe um documento válido').max(18),
  name: z.string().min(2, 'Informe o nome').max(200),
  email: z.string().email('Informe um e-mail válido').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  zipCode: z.string().max(10).optional().or(z.literal('')),
  street: z.string().max(200).optional().or(z.literal('')),
  number: z.string().max(20).optional().or(z.literal('')),
  complement: z.string().max(100).optional().or(z.literal('')),
  neighborhood: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(150).optional().or(z.literal('')),
  state: z.string().length(2, 'Use a sigla com 2 letras').optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
