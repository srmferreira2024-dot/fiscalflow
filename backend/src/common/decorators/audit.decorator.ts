import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

/**
 * Marca um handler para ser registrado no AuditLog pelo AuditLogInterceptor
 * após uma resposta bem-sucedida. `entity` identifica o tipo de recurso (ex: "User", "Company").
 */
export const Audit = (action: string, entity: string): ReturnType<typeof SetMetadata> =>
  SetMetadata(AUDIT_ACTION_KEY, { action, entity });
