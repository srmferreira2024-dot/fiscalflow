import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

function buildContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('TenantGuard', () => {
  const guard = new TenantGuard();

  it('permite acesso quando o usuário possui officeId', () => {
    expect(guard.canActivate(buildContext({ officeId: 'office-1' }))).toBe(true);
  });

  it('nega acesso quando não há usuário autenticado', () => {
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(UnauthorizedException);
  });

  it('nega acesso quando o usuário não possui officeId', () => {
    expect(() => guard.canActivate(buildContext({ officeId: undefined }))).toThrow(
      UnauthorizedException,
    );
  });
});
