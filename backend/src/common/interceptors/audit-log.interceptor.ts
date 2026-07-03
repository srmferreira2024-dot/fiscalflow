import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

interface AuditMetadata {
  action: string;
  entity: string;
}

interface AuditableResponse {
  user?: { id?: string; officeId?: string };
  id?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadata | undefined>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const ipAddress = request.ip ?? request.socket?.remoteAddress ?? null;

    return next.handle().pipe(
      tap((result: AuditableResponse) => {
        const officeId = request.user?.officeId ?? result?.user?.officeId;
        const userId = request.user?.userId ?? result?.user?.id;

        if (!officeId) {
          return;
        }

        this.prisma.auditLog
          .create({
            data: {
              officeId,
              userId: userId ?? null,
              action: metadata.action,
              entity: metadata.entity,
              entityId: result?.id ?? result?.user?.id ?? null,
              ipAddress,
            },
          })
          .catch((error: unknown) => this.logger.error('Falha ao gravar audit log', error));
      }),
    );
  }
}
