import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface InvoiceEmissionJobData {
  invoiceId: string;
  companyId: string;
  officeId: string;
  clientId: string;
  attemptNumber: number;
  lastError?: string;
}

@Injectable()
export class InvoiceEmissionQueue {
  constructor(
    @InjectQueue('invoice-emission')
    private readonly queue: Queue<InvoiceEmissionJobData>,
  ) {}

  async addEmissionJob(data: InvoiceEmissionJobData) {
    return this.queue.add(data, {
      jobId: `${data.invoiceId}-${data.attemptNumber}`,
    });
  }
}
