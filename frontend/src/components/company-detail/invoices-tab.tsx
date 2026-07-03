'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Download, RotateCcw, X } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

async function fetchInvoices(companyId: string): Promise<Invoice[]> {
  const res = await fetch(`/bff/companies/${companyId}/invoices`);
  if (!res.ok) throw new Error('Erro ao carregar notas');
  return res.json();
}

async function fetchClients(companyId: string) {
  const res = await fetch(`/bff/companies/${companyId}/clients`);
  if (!res.ok) throw new Error('Erro ao carregar clientes');
  return res.json();
}

async function fetchProducts(companyId: string) {
  const res = await fetch(`/bff/companies/${companyId}/products`);
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  return res.json();
}

function statusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    [InvoiceStatus.RASCUNHO]: 'bg-slate-200 text-slate-900',
    [InvoiceStatus.PENDENTE_FILA]: 'bg-yellow-200 text-yellow-900',
    [InvoiceStatus.PROCESSANDO]: 'bg-yellow-200 text-yellow-900',
    [InvoiceStatus.AUTORIZADA]: 'bg-green-200 text-green-900',
    [InvoiceStatus.REJEITADA]: 'bg-red-200 text-red-900',
    [InvoiceStatus.ERRO_PERMANENTE]: 'bg-red-200 text-red-900',
    [InvoiceStatus.CANCELADA]: 'bg-slate-200 text-slate-900',
  };
  return colors[status];
}

export function InvoicesTab({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['invoices', companyId];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    clientId: string;
    productId: string;
    quantidade: number;
    valorUnitario: number;
  }>({ clientId: '', productId: '', quantidade: 1, valorUnitario: 0 });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchInvoices(companyId),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', companyId],
    queryFn: () => fetchClients(companyId),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', companyId],
    queryFn: () => fetchProducts(companyId),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/bff/companies/${companyId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          items: [
            {
              productId: formData.productId,
              quantidade: formData.quantidade,
              valorUnitario: formData.valorUnitario,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error('Erro ao emitir nota');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setDialogOpen(false);
      setFormData({ clientId: '', productId: '', quantidade: 1, valorUnitario: 0 });
      setServerError(null);
    },
    onError: (err) => setServerError(err instanceof Error ? err.message : 'Erro desconhecido'),
  });

  const reemitMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/bff/companies/${companyId}/invoices/${invoiceId}?action=reemit`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Erro ao reemitir');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
      const res = await fetch(`/bff/companies/${companyId}/invoices/${invoiceId}?action=cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Cancelado pelo usuário' }),
      });
      if (!res.ok) throw new Error('Erro ao cancelar');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Carregando notas...</div>;

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Nota
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {serverError && <div className="text-sm text-red-600">{serverError}</div>}

            <div>
              <label className="text-sm font-medium">Cliente</label>
              {/* @ts-expect-error - SelectItem value can be any string */}
              <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Produto</label>
              {/* @ts-expect-error - SelectItem value can be any string */}
              <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantidade</label>
              <Input
                type="number"
                step="0.001"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Valor Unitário</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorUnitario}
                onChange={(e) => setFormData({ ...formData, valorUnitario: parseFloat(e.target.value) })}
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? 'Emitindo...' : 'Emitir Nota'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma nota fiscal ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Nota {invoice.numero || 'Pendente'}</p>
                    <span className={`text-xs px-2 py-1 rounded ${statusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString('pt-BR')} • R$ {invoice.valorTotal.toFixed(2)}
                  </p>
                  {invoice.lastErrorMessage && (
                    <p className="text-xs text-red-600">{invoice.lastErrorMessage}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {invoice.status === InvoiceStatus.AUTORIZADA && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/bff/companies/${companyId}/invoices/${invoice.id}?action=xml`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {(invoice.status === InvoiceStatus.RASCUNHO || invoice.status === InvoiceStatus.ERRO_PERMANENTE) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => reemitMutation.mutate(invoice.id)}
                      disabled={reemitMutation.isPending}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {invoice.status !== InvoiceStatus.CANCELADA && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelMutation.mutate({ invoiceId: invoice.id })}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
