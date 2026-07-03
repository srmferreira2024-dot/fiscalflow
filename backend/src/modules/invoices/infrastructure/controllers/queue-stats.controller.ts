import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('queue')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('queue')
export class QueueStatsController {
  constructor(@Inject(getQueueToken('invoice-emission')) private queue: Queue) {}

  @Get('stats')
  @Roles('ADMIN', 'CONTADOR')
  async getStats() {
    const [pending, active, delayed, failed, completed] = await Promise.all([
      this.queue.count(),
      this.queue.getActiveCount(),
      this.queue.getDelayedCount(),
      this.queue.getFailedCount(),
      this.queue.getCompletedCount(),
    ]);

    return {
      pending,
      active,
      delayed,
      failed,
      completed,
      total: pending + active + delayed + failed + completed,
    };
  }

  @Get('jobs/failed')
  @Roles('ADMIN', 'CONTADOR')
  async getFailedJobs(@Param('limit') limit = 10) {
    const jobs = await this.queue.getFailed(0, limit - 1);
    return jobs.map((job) => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      stacktrace: job.stacktrace,
    }));
  }
}
