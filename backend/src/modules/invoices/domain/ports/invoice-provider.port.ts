/**
 * Contrato único de comunicação com qualquer provedor externo de emissão fiscal
 * (prefeituras, SEFAZ, gateways como Focus NFe, eNotas, PlugNotas etc.).
 *
 * REGRA MAIS IMPORTANTE do FiscalFlow: nenhuma regra de negócio pode depender de um
 * fornecedor específico. Toda integração fiscal é implementada como um Adapter que
 * satisfaz esta interface (Strategy + Adapter pattern) e é injetada via DI — nunca
 * referenciada diretamente pelos módulos de domínio (Notas, Automações etc.).
 *
 * Implementação inicial (Sprint 5): apenas o Adapter mock
 * (modules/invoices/infrastructure/adapters/mock-invoice-provider.adapter.ts), simulando
 * emissão/cancelamento sem chamar nenhum serviço externo. Qualquer Adapter fiscal real
 * (SEFAZ/prefeituras/Focus NFe etc.) implementa esta mesma interface e é trocado só no
 * binding do token INVOICE_PROVIDER em invoices.module.ts — nunca no InvoicesService.
 * Ver docs/ARQUITETURA.md.
 */
export interface InvoiceProvider {
  emitirNota(input: EmitirNotaInput): Promise<EmitirNotaOutput>;
  cancelarNota(input: CancelarNotaInput): Promise<CancelarNotaOutput>;
  consultarNota(input: ConsultarNotaInput): Promise<ConsultarNotaOutput>;
  baixarXML(input: BaixarArquivoInput): Promise<Buffer>;
  baixarPDF(input: BaixarArquivoInput): Promise<Buffer>;
  listarMunicipios(): Promise<MunicipioOutput[]>;
  validarCertificado(input: ValidarCertificadoInput): Promise<ValidarCertificadoOutput>;
}

export interface EmitirNotaInput {
  companyId: string;
  clienteDocumento: string;
  clienteNome: string;
  descricaoServico: string;
  valor: number;
  [key: string]: unknown;
}

export interface EmitirNotaOutput {
  notaId: string;
  numero: string;
  status: 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA';
  protocolo?: string;
}

export interface CancelarNotaInput {
  companyId: string;
  notaId: string;
  motivo: string;
}

export interface CancelarNotaOutput {
  notaId: string;
  status: 'CANCELADA' | 'ERRO';
}

export interface ConsultarNotaInput {
  companyId: string;
  notaId: string;
}

export interface ConsultarNotaOutput {
  notaId: string;
  status: string;
  detalhes?: Record<string, unknown>;
}

export interface BaixarArquivoInput {
  companyId: string;
  notaId: string;
}

export interface MunicipioOutput {
  codigoIbge: string;
  nome: string;
  uf: string;
}

export interface ValidarCertificadoInput {
  companyId: string;
  certificadoBase64: string;
  senha: string;
}

export interface ValidarCertificadoOutput {
  valido: boolean;
  validoAte?: Date;
  motivoInvalidez?: string;
}

export const INVOICE_PROVIDER = 'INVOICE_PROVIDER';
