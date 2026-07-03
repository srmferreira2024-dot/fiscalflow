import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
