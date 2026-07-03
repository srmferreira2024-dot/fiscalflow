import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import {
  BaixarArquivoInput,
  CancelarNotaInput,
  CancelarNotaOutput,
  ConsultarNotaInput,
  ConsultarNotaOutput,
  EmitirNotaInput,
  EmitirNotaOutput,
  InvoiceProvider,
  MunicipioOutput,
  ValidarCertificadoInput,
  ValidarCertificadoOutput,
} from '../../domain/ports/invoice-provider.port';

const STATIC_MUNICIPIOS: MunicipioOutput[] = [
  { codigoIbge: '3550308', nome: 'São Paulo', uf: 'SP' },
  { codigoIbge: '3304557', nome: 'Rio de Janeiro', uf: 'RJ' },
  { codigoIbge: '3106200', nome: 'Belo Horizonte', uf: 'MG' },
];

/**
 * Adapter mock: simula emissão/cancelamento/consulta de forma determinística, sem
 * chamar nenhum serviço externo. É o primeiro (e único, nesta sprint) Adapter que
 * satisfaz InvoiceProvider — provas de que o núcleo do sistema (InvoicesService) nunca
 * precisa saber qual provedor está por trás.
 */
@Injectable()
export class MockInvoiceProviderAdapter implements InvoiceProvider {
  constructor(private readonly prisma: PrismaService) {}

  emitirNota(input: EmitirNotaInput): Promise<EmitirNotaOutput> {
    const notaId = typeof input.notaId === 'string' ? input.notaId : randomUUID();

    return Promise.resolve({
      notaId,
      numero: `MOCK-${Date.now()}`,
      status: 'AUTORIZADA',
      protocolo: randomUUID(),
    });
  }

  cancelarNota(input: CancelarNotaInput): Promise<CancelarNotaOutput> {
    return Promise.resolve({
      notaId: input.notaId,
      status: 'CANCELADA',
    });
  }

  consultarNota(input: ConsultarNotaInput): Promise<ConsultarNotaOutput> {
    return Promise.resolve({
      notaId: input.notaId,
      status: 'AUTORIZADA',
      detalhes: { provider: 'mock' },
    });
  }

  baixarXML(input: BaixarArquivoInput): Promise<Buffer> {
    return Promise.resolve(
      Buffer.from(`<?xml version="1.0"?><nota id="${input.notaId}" provider="mock" />`, 'utf-8'),
    );
  }

  baixarPDF(input: BaixarArquivoInput): Promise<Buffer> {
    return Promise.resolve(
      Buffer.from(`PDF simulado da nota ${input.notaId} (provider mock)`, 'utf-8'),
    );
  }

  listarMunicipios(): Promise<MunicipioOutput[]> {
    return Promise.resolve(STATIC_MUNICIPIOS);
  }

  async validarCertificado(input: ValidarCertificadoInput): Promise<ValidarCertificadoOutput> {
    const certificate = await this.prisma.companyCertificate.findUnique({
      where: { companyId: input.companyId },
    });

    if (!certificate) {
      return { valido: false, motivoInvalidez: 'Nenhum certificado A1 cadastrado' };
    }

    return { valido: true, validoAte: certificate.validoAte ?? undefined };
  }
}
