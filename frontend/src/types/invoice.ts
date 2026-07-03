export enum InvoiceStatus {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_FILA = 'PENDENTE_FILA',
  PROCESSANDO = 'PROCESSANDO',
  AUTORIZADA = 'AUTORIZADA',
  REJEITADA = 'REJEITADA',
  ERRO_PERMANENTE = 'ERRO_PERMANENTE',
  CANCELADA = 'CANCELADA',
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  productId?: string;
  serviceItemId?: string;
}

export interface Invoice {
  id: string;
  officeId: string;
  companyId: string;
  clientId: string;
  status: InvoiceStatus;
  numero?: string;
  protocolo?: string;
  valorTotal: number;
  dataEmissao?: string;
  motivo?: string;
  lastErrorMessage?: string;
  providerName: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}
