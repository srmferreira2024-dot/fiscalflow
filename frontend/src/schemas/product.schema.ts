import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().min(1, 'Informe o código').max(50),
  name: z.string().min(2, 'Informe o nome').max(200),
  ncm: z.string().max(10).optional().or(z.literal('')),
  cfop: z.string().max(10).optional().or(z.literal('')),
  cst: z.string().max(10).optional().or(z.literal('')),
  price: z.number().min(0, 'Informe um preço válido'),
  category: z.string().max(100).optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productSchema>;
