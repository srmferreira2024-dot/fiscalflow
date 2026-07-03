'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { clientSchema, type ClientFormValues } from '@/schemas/client.schema';
import type { Client } from '@/types/auth';

type DialogState = { mode: 'create' } | { mode: 'edit'; client: Client } | null;

async function fetchClients(companyId: string): Promise<Client[]> {
  const response = await fetch(`/bff/companies/${companyId}/clients`);
  if (!response.ok) throw new Error('Não foi possível carregar os clientes');
  return response.json() as Promise<Client[]>;
}

export function ClientsTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['clients', companyId];
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({ queryKey, queryFn: () => fetchClients(companyId) });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({ resolver: zodResolver(clientSchema) });

  useEffect(() => {
    if (dialogState?.mode === 'edit') {
      const { client } = dialogState;
      reset({
        documentType: client.documentType,
        document: client.document,
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        zipCode: client.zipCode ?? '',
        street: client.street ?? '',
        number: client.number ?? '',
        complement: client.complement ?? '',
        neighborhood: client.neighborhood ?? '',
        city: client.city ?? '',
        state: client.state ?? '',
        notes: client.notes ?? '',
      });
    } else if (dialogState?.mode === 'create') {
      reset({ documentType: 'CPF' });
    }
  }, [dialogState, reset]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/bff/companies/${companyId}/clients/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Não foi possível remover o cliente');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function onSubmit(values: ClientFormValues) {
    setServerError(null);

    const isEdit = dialogState?.mode === 'edit';
    const url = isEdit
      ? `/bff/companies/${companyId}/clients/${dialogState.client.id}`
      : `/bff/companies/${companyId}/clients`;

    const response = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível salvar o cliente');
      return;
    }

    await queryClient.invalidateQueries({ queryKey });
    setDialogState(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Clientes desta empresa</p>
        <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
          Novo cliente
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="text-sm text-destructive">Não foi possível carregar os clientes.</p>}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((client) => (
            <li
              key={client.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => setDialogState({ mode: 'edit', client })}
              >
                <p>{client.name}</p>
                <p className="text-xs text-muted-foreground">
                  {client.documentType} · {client.document}
                </p>
              </button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(client.id)}
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
            <DialogTitle>{dialogState?.mode === 'edit' ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-[auto_1fr] gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="documentType">Tipo</Label>
                <Controller
                  control={control}
                  name="documentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="documentType" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="document">Documento</Label>
                <Input id="document" {...register('document')} />
                {errors.document && (
                  <p className="text-sm text-destructive">{errors.document.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" {...register('neighborhood')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">UF</Label>
                <Input id="state" maxLength={2} className="w-16" {...register('state')} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" rows={3} {...register('notes')} />
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
