import { MockInvoiceProviderAdapter } from './mock-invoice-provider.adapter';
import { PrismaService } from '../../../../infra/prisma/prisma.service';

describe('MockInvoiceProviderAdapter', () => {
  function buildAdapter(certificate: unknown = null) {
    const prisma = {
      companyCertificate: {
        findUnique: jest.fn().mockResolvedValue(certificate),
      },
    } as unknown as PrismaService;

    return new MockInvoiceProviderAdapter(prisma);
  }

  it('emite nota com status AUTORIZADA e protocolo preenchido', async () => {
    const adapter = buildAdapter();

    const result = await adapter.emitirNota({
      companyId: 'company-1',
      clienteDocumento: '11144477735',
      clienteNome: 'Cliente Teste',
      descricaoServico: 'Serviço de teste',
      valor: 100,
    });

    expect(result.status).toBe('AUTORIZADA');
    expect(result.numero).toMatch(/^MOCK-/);
    expect(result.protocolo).toBeDefined();
  });

  it('cancela nota retornando status CANCELADA', async () => {
    const adapter = buildAdapter();

    const result = await adapter.cancelarNota({
      companyId: 'company-1',
      notaId: 'nota-1',
      motivo: 'Erro de digitação',
    });

    expect(result).toEqual({ notaId: 'nota-1', status: 'CANCELADA' });
  });

  it('consulta nota retornando status AUTORIZADA', async () => {
    const adapter = buildAdapter();

    const result = await adapter.consultarNota({ companyId: 'company-1', notaId: 'nota-1' });

    expect(result.notaId).toBe('nota-1');
    expect(result.status).toBe('AUTORIZADA');
  });

  it('baixa XML e PDF como buffers não vazios', async () => {
    const adapter = buildAdapter();

    const xml = await adapter.baixarXML({ companyId: 'company-1', notaId: 'nota-1' });
    const pdf = await adapter.baixarPDF({ companyId: 'company-1', notaId: 'nota-1' });

    expect(xml.length).toBeGreaterThan(0);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it('lista municípios estáticos', async () => {
    const adapter = buildAdapter();

    const municipios = await adapter.listarMunicipios();

    expect(municipios.length).toBeGreaterThan(0);
    expect(municipios[0]).toHaveProperty('codigoIbge');
  });

  it('valida certificado como inválido quando a empresa não tem nenhum', async () => {
    const adapter = buildAdapter(null);

    const result = await adapter.validarCertificado({
      companyId: 'company-1',
      certificadoBase64: 'qualquer',
      senha: 'qualquer',
    });

    expect(result.valido).toBe(false);
  });

  it('valida certificado como válido quando a empresa tem um cadastrado', async () => {
    const adapter = buildAdapter({ validoAte: null });

    const result = await adapter.validarCertificado({
      companyId: 'company-1',
      certificadoBase64: 'qualquer',
      senha: 'qualquer',
    });

    expect(result.valido).toBe(true);
  });
});
