'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCompanySchema, type CreateCompanyFormValues } from '@/schemas/company.schema';
import type { Company } from '@/types/auth';

const TAX_REGIME_OPTIONS = [
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'LUCRO_REAL', label: 'Lucro Real' },
  { value: 'MEI', label: 'MEI' },
];

export default function NewCompanyPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({ resolver: zodResolver(createCompanySchema) });

  async function onSubmit(values: CreateCompanyFormValues) {
    setServerError(null);

    const payload = {
      ...values,
      nomeFantasia: values.nomeFantasia || undefined,
      regimeTributario: values.regimeTributario || undefined,
      municipio: values.municipio || undefined,
      uf: values.uf || undefined,
    };

    const response = await fetch('/bff/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível criar a empresa');
      return;
    }

    const company = (await response.json()) as Company;
    router.push(`/dashboard/empresas/${company.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nova Empresa</h1>
        <p className="text-sm text-muted-foreground">
          Os demais campos fiscais podem ser preenchidos depois, na página da empresa.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Dados iniciais</CardTitle>
          <CardDescription>CNPJ e razão social são obrigatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00000000000000" {...register('cnpj')} />
              {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="razaoSocial">Razão Social</Label>
              <Input id="razaoSocial" {...register('razaoSocial')} />
              {errors.razaoSocial && (
                <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input id="nomeFantasia" {...register('nomeFantasia')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="regimeTributario">Regime Tributário</Label>
              <Controller
                control={control}
                name="regimeTributario"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger id="regimeTributario" className="w-full">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_REGIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="municipio">Município</Label>
                <Input id="municipio" {...register('municipio')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" maxLength={2} className="w-16" {...register('uf')} />
                {errors.uf && <p className="text-sm text-destructive">{errors.uf.message}</p>}
              </div>
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Salvando...' : 'Criar empresa'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
