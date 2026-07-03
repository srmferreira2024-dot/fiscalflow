import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

/**
 * Garante que toda rota protegida tenha um tenant (officeId) resolvido a partir do JWT.
 * Repositórios/serviços SEMPRE devem filtrar por request.user.officeId — nunca por um
 * officeId vindo de parâmetro de URL/body — para eliminar vazamento entre tenants.
 */
@Injectable()
export class TenantGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();

    if (!request.user?.officeId) {
      throw new UnauthorizedException('Tenant não identificado para este usuário');
    }

    return true;
  }
}
