import { z } from 'zod';

export const serviceItemSchema = z.object({
  code: z.string().min(1, 'Informe o código').max(20),
  description: z.string().min(2, 'Informe a descrição').max(500),
  issAliquota: z.number().min(0).max(100).optional(),
  municipio: z.string().max(150).optional().or(z.literal('')),
});

export type ServiceItemFormValues = z.infer<typeof serviceItemSchema>;
