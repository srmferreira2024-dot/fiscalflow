import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/prisma/prisma.service';

interface ListLogsInput {
  skip: number;
  take: number;
  action?: string;
  entity?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(officeId: string, input: ListLogsInput) {
    const where: any = { officeId };
    if (input.action) where.action = input.action;
    if (input.entity) where.entity = input.entity;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: input.skip,
        take: input.take,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        user: log.user ? { id: log.user.id, name: log.user.name, email: log.user.email } : null,
        ipAddress: log.ipAddress,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
      pagination: {
        total,
        skip: input.skip,
        take: input.take,
      },
    };
  }
}
