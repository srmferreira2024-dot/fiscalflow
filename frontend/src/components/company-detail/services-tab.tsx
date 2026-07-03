'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { serviceItemSchema, type ServiceItemFormValues } from '@/schemas/service.schema';
import type { ServiceItem } from '@/types/auth';

type DialogState = { mode: 'create' } | { mode: 'edit'; service: ServiceItem } | null;

async function fetchServices(companyId: string): Promise<ServiceItem[]> {
  const response = await fetch(`/bff/companies/${companyId}/services`);
  if (!response.ok) throw new Error('Não foi possível carregar os serviços');
  return response.json() as Promise<ServiceItem[]>;
}

export function ServicesTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['services', companyId];
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchServices(companyId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceItemFormValues>({ resolver: zodResolver(serviceItemSchema) });

  useEffect(() => {
    if (dialogState?.mode === 'edit') {
      const { service } = dialogState;
      reset({
        code: service.code,
        description: service.description,
        issAliquota: service.issAliquota ? Number(service.issAliquota) : undefined,
        municipio: service.municipio ?? '',
      });
    } else if (dialogState?.mode === 'create') {
      reset({ code: '', description: '' });
    }
  }, [dialogState, reset]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/bff/companies/${companyId}/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Não foi possível remover o serviço');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function onSubmit(values: ServiceItemFormValues) {
    setServerError(null);

    const isEdit = dialogState?.mode === 'edit';
    const url = isEdit
      ? `/bff/companies/${companyId}/services/${dialogState.service.id}`
      : `/bff/companies/${companyId}/services`;

    const response = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível salvar o serviço');
      return;
    }

    await queryClient.invalidateQueries({ queryKey });
    setDialogState(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Serviços desta empresa</p>
        <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
          Novo serviço
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="text-sm text-destructive">Não foi possível carregar os serviços.</p>}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => setDialogState({ mode: 'edit', service })}
              >
                <p>{service.description}</p>
                <p className="text-xs text-muted-foreground">
                  {service.code}
                  {service.issAliquota && ` · ISS ${service.issAliquota}%`}
                  {service.municipio && ` · ${service.municipio}`}
                </p>
              </button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(service.id)}
                disabled={deleteMutation.isPending}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogState !== null} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState?.mode === 'edit' ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Código (LC 116)</Label>
                <Input id="code" placeholder="1.04" {...register('code')} />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="issAliquota">ISS (%)</Label>
                <Input
                  id="issAliquota"
                  type="number"
                  step="0.01"
                  className="w-24"
                  {...register('issAliquota', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={3} {...register('description')} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="municipio">Município</Label>
              <Input id="municipio" {...register('municipio')} />
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
