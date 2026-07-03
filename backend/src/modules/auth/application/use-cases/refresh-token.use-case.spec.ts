import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { TokenService } from '../services/token.service';

describe('RefreshTokenUseCase', () => {
  function buildUseCase() {
    const prisma = {
      refreshToken: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;

    const tokenService = {
      hashRefreshToken: jest.fn().mockReturnValue('hashed-token'),
      signAccessToken: jest.fn().mockReturnValue('new-access-token'),
      issueRefreshToken: jest.fn().mockReturnValue({
        token: 'new-refresh-token',
        tokenHash: 'new-hashed-token',
        expiresAt: new Date(),
      }),
    } as unknown as TokenService;

    return { useCase: new RefreshTokenUseCase(prisma, tokenService), prisma };
  }

  it('rotaciona o refresh token quando válido', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: {
        id: 'user-1',
        officeId: 'office-1',
        name: 'Admin',
        email: 'admin@escritorio.com.br',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    const result = await useCase.execute({ refreshToken: 'raw-token' });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });

  it('rejeita quando o token não existe', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'raw-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita quando o token já foi revogado', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: { isActive: true },
    });

    await expect(useCase.execute({ refreshToken: 'raw-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita quando o token está expirado', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'token-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      user: { isActive: true },
    });

    await expect(useCase.execute({ refreshToken: 'raw-token' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
