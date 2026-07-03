import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InvoicesService } from '../../application/services/invoices.service';
import type { InvoiceEmissionJobData } from '../queues/invoice-emission.queue';

@Processor('invoice-emission')
@Injectable()
export class InvoiceEmissionProcessor {
  private readonly logger = new Logger(InvoiceEmissionProcessor.name);

  constructor(private readonly invoicesService: InvoicesService) {}

  @Process()
  async handleEmission(job: Job<InvoiceEmissionJobData>) {
    const { invoiceId, companyId, officeId, clientId, attemptNumber } = job.data;

    try {
      this.logger.debug(
        `Processando emissão de nota ${invoiceId} (tentativa ${attemptNumber})`,
      );

      await this.invoicesService.updateStatusUnsafe(invoiceId, 'PROCESSANDO');

      const result = await this.invoicesService.emitirViaProvider(
        invoiceId,
        companyId,
        officeId,
        clientId,
      );

      if (result.status === 'AUTORIZADA') {
        this.logger.log(
          `Nota ${invoiceId} emitida com sucesso (número: ${result.numero})`,
        );
        return { success: true, result };
      }

      if (result.status === 'REJEITADA') {
        await this.invoicesService.updateStatusUnsafe(invoiceId, 'REJEITADA');
        throw new Error(`Provider rejeitou a emissão da nota`);
      }

      throw new Error(
        `Emissão falhou na tentativa ${attemptNumber}: status desconhecido`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Invoice ${invoiceId} — tentativa ${attemptNumber} falhou: ${errorMessage}`,
      );

      if (attemptNumber >= 3) {
        await this.invoicesService.updateStatusUnsafe(
          invoiceId,
          'ERRO_PERMANENTE',
          { lastErrorMessage: errorMessage },
        );
        this.logger.error(
          `Nota ${invoiceId} marcada como ERRO_PERMANENTE após 3 tentativas`,
        );
      }

      throw error;
    }
  }
}
