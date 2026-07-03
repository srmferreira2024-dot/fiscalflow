'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { productSchema, type ProductFormValues } from '@/schemas/product.schema';
import type { Product } from '@/types/auth';

type DialogState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

async function fetchProducts(companyId: string): Promise<Product[]> {
  const response = await fetch(`/bff/companies/${companyId}/products`);
  if (!response.ok) throw new Error('Não foi possível carregar os produtos');
  return response.json() as Promise<Product[]>;
}

export function ProductsTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['products', companyId];
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchProducts(companyId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (dialogState?.mode === 'edit') {
      const { product } = dialogState;
      reset({
        code: product.code,
        name: product.name,
        ncm: product.ncm ?? '',
        cfop: product.cfop ?? '',
        cst: product.cst ?? '',
        price: Number(product.price),
        category: product.category ?? '',
      });
    } else if (dialogState?.mode === 'create') {
      reset({ code: '', name: '', price: 0 });
    }
  }, [dialogState, reset]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/bff/companies/${companyId}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Não foi possível remover o produto');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function onSubmit(values: ProductFormValues) {
    setServerError(null);

    const isEdit = dialogState?.mode === 'edit';
    const url = isEdit
      ? `/bff/companies/${companyId}/products/${dialogState.product.id}`
      : `/bff/companies/${companyId}/products`;

    const response = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível salvar o produto');
      return;
    }

    await queryClient.invalidateQueries({ queryKey });
    setDialogState(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Produtos desta empresa</p>
        <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
          Novo produto
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {isError && <p className="text-sm text-destructive">Não foi possível carregar os produtos.</p>}
      {data && data.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
      )}

      {data && data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => setDialogState({ mode: 'edit', product })}
              >
                <p>{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.code} · R$ {Number(product.price).toFixed(2)}
                  {product.ncm && ` · NCM ${product.ncm}`}
                </p>
              </button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(product.id)}
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
            <DialogTitle>{dialogState?.mode === 'edit' ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Código</Label>
                <Input id="code" {...register('code')} />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ncm">NCM</Label>
                <Input id="ncm" {...register('ncm')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cfop">CFOP</Label>
                <Input id="cfop" {...register('cfop')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cst">CST</Label>
                <Input id="cst" {...register('cst')} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" {...register('category')} />
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
