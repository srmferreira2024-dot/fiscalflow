import { z } from 'zod';

export const createInvoiceItemSchema = z.object({
  description: z.string().optional(),
  quantidade: z.number().min(0.001).max(999999.999),
  valorUnitario: z.number().min(0).max(999999.99),
  productId: z.string().uuid().optional(),
  serviceItemId: z.string().uuid().optional(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Cliente obrigatório'),
  items: z.array(createInvoiceItemSchema).min(1, 'Adicione pelo menos um item'),
});

export const cancelInvoiceSchema = z.object({
  motivo: z.string().min(3, 'Motivo deve ter pelo menos 3 caracteres'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceItemInput = z.infer<typeof createInvoiceItemSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
