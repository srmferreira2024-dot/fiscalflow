import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { TokenService } from './token.service';
import { AppConfig } from '../../../../config/configuration';

describe('TokenService', () => {
  function buildService(refreshExpiresIn = '7d') {
    const jwtService = { sign: jest.fn().mockReturnValue('signed-jwt') } as unknown as JwtService;
    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'jwt.accessSecret': 'access-secret',
          'jwt.accessExpiresIn': '15m',
          'jwt.refreshExpiresIn': refreshExpiresIn,
        };
        return values[key];
      }),
    } as unknown as ConfigService<AppConfig, true>;

    return new TokenService(jwtService, configService);
  }

  it('assina o access token com o payload informado', () => {
    const service = buildService();
    const token = service.signAccessToken({
      userId: 'user-1',
      officeId: 'office-1',
      email: 'admin@escritorio.com.br',
      role: UserRole.ADMIN,
    });

    expect(token).toBe('signed-jwt');
  });

  it('gera refresh token com hash e expiração consistente com a configuração', () => {
    const service = buildService('1d');
    const before = Date.now();
    const issued = service.issueRefreshToken();
    const after = Date.now();

    expect(issued.token).toHaveLength(96);
    expect(issued.tokenHash).toBe(service.hashRefreshToken(issued.token));
    expect(issued.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000 - 1000);
    expect(issued.expiresAt.getTime()).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000 + 1000);
  });

  it('produz o mesmo hash para o mesmo token', () => {
    const service = buildService();
    expect(service.hashRefreshToken('abc')).toBe(service.hashRefreshToken('abc'));
    expect(service.hashRefreshToken('abc')).not.toBe(service.hashRefreshToken('xyz'));
  });
});
