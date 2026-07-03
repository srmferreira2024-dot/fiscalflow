'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateFiscalDataSchema, type UpdateFiscalDataFormValues } from '@/schemas/company.schema';
import type { Company } from '@/types/auth';

const TAX_REGIME_OPTIONS = [
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'LUCRO_REAL', label: 'Lucro Real' },
  { value: 'MEI', label: 'MEI' },
];

export function FiscalDataTab({ company }: { company: Company }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateFiscalDataFormValues>({
    resolver: zodResolver(updateFiscalDataSchema),
    defaultValues: {
      razaoSocial: company.razaoSocial,
      nomeFantasia: company.nomeFantasia ?? '',
      regimeTributario: company.regimeTributario ?? undefined,
      inscricaoEstadual: company.inscricaoEstadual ?? '',
      inscricaoMunicipal: company.inscricaoMunicipal ?? '',
      cnae: company.cnae ?? '',
      municipio: company.municipio ?? '',
      uf: company.uf ?? '',
    },
  });

  async function onSubmit(values: UpdateFiscalDataFormValues) {
    setServerError(null);
    setSuccess(false);

    const response = await fetch(`/bff/companies/${company.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível salvar as alterações');
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form className="flex max-w-lg flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
                <SelectValue placeholder="Selecione" />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
          <Input id="inscricaoEstadual" {...register('inscricaoEstadual')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
          <Input id="inscricaoMunicipal" {...register('inscricaoMunicipal')} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cnae">CNAE</Label>
        <Input id="cnae" placeholder="0000-0/00" {...register('cnae')} />
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
      {success && <p className="text-sm text-emerald-600">Dados salvos com sucesso.</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
