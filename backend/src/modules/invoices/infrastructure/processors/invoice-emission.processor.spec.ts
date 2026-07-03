import { Test } from '@nestjs/testing';
import { Job } from 'bull';
import { InvoiceEmissionProcessor } from './invoice-emission.processor';
import { InvoicesService } from '../../application/services/invoices.service';
import type { InvoiceEmissionJobData } from '../queues/invoice-emission.queue';

describe('InvoiceEmissionProcessor', () => {
  let processor: InvoiceEmissionProcessor;
  let invoicesService: InvoicesService;

  beforeEach(async () => {
    invoicesService = {
      updateStatusUnsafe: jest.fn(),
      emitirViaProvider: jest.fn(),
    } as any as InvoicesService;

    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoiceEmissionProcessor,
        { provide: InvoicesService, useValue: invoicesService },
      ],
    }).compile();

    processor = moduleRef.get(InvoiceEmissionProcessor);
  });

  describe('handleEmission', () => {
    const jobData: InvoiceEmissionJobData = {
      invoiceId: 'invoice-1',
      companyId: 'company-1',
      officeId: 'office-1',
      clientId: 'client-1',
      attemptNumber: 1,
    };

    it('emite com sucesso e atualiza status para AUTORIZADA', async () => {
      (invoicesService.emitirViaProvider as jest.Mock).mockResolvedValue({
        status: 'AUTORIZADA',
        numero: 'NFe123',
        protocolo: 'PROTO123',
        id: 'invoice-1',
      });

      const job = { data: jobData } as Job<InvoiceEmissionJobData>;

      const result = await processor.handleEmission(job);

      expect(result).toEqual({ success: true, result: expect.any(Object) });
      expect(invoicesService.updateStatusUnsafe).toHaveBeenCalledWith(
        'invoice-1',
        'PROCESSANDO',
      );
    });

    it('rejeita emissão quando provider retorna REJEITADA', async () => {
      (invoicesService.emitirViaProvider as jest.Mock).mockResolvedValue({
        status: 'REJEITADA',
        rejectReason: 'Dados inválidos',
      });

      const job = { data: jobData } as Job<InvoiceEmissionJobData>;

      await expect(processor.handleEmission(job)).rejects.toThrow();
      expect(invoicesService.updateStatusUnsafe).toHaveBeenCalledWith(
        'invoice-1',
        'REJEITADA',
      );
    });

    it('atualiza para ERRO_PERMANENTE após 3 tentativas', async () => {
      (invoicesService.emitirViaProvider as jest.Mock).mockRejectedValue(
        new Error('Timeout no provider'),
      );

      const job = {
        data: { ...jobData, attemptNumber: 3 },
      } as Job<InvoiceEmissionJobData>;

      await expect(processor.handleEmission(job)).rejects.toThrow();
      expect(invoicesService.updateStatusUnsafe).toHaveBeenCalledWith(
        'invoice-1',
        'ERRO_PERMANENTE',
        expect.objectContaining({ lastErrorMessage: expect.any(String) }),
      );
    });
  });
});
