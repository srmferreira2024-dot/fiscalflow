'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { z } from 'zod';

const registerSchema = z.object({
  officeName: z.string().min(2, 'Nome do escritório é obrigatório'),
  userName: z.string().min(2, 'Seu nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    const response = await fetch('/bff/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Erro ao criar conta');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Configure seu escritório de contabilidade no FiscalFlow</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="officeName">Nome do Escritório</Label>
              <Input
                id="officeName"
                placeholder="Escritório ABC Contabilidade"
                {...register('officeName')}
              />
              {errors.officeName && (
                <p className="text-sm text-destructive">{errors.officeName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="userName">Seu Nome</Label>
              <Input
                id="userName"
                placeholder="João Silva"
                {...register('userName')}
              />
              {errors.userName && (
                <p className="text-sm text-destructive">{errors.userName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@escritorio.com.br"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
