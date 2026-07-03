import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRole } from '@prisma/client';
import { LoginUseCase } from './login.use-case';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { TokenService } from '../services/token.service';
import { LoginDto } from '../dto/login.dto';

describe('LoginUseCase', () => {
  const dto: LoginDto = { email: 'admin@escritorio.com.br', password: 'SenhaForte@123' };

  function buildUseCase() {
    const prisma = {
      user: { findUnique: jest.fn(), update: jest.fn() },
      refreshToken: { create: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;

    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      issueRefreshToken: jest.fn().mockReturnValue({
        token: 'refresh-token',
        tokenHash: 'hashed-refresh-token',
        expiresAt: new Date(),
      }),
    } as unknown as TokenService;

    return { useCase: new LoginUseCase(prisma, tokenService), prisma, tokenService };
  }

  it('autentica usuário com credenciais válidas', async () => {
    const passwordHash = await argon2.hash(dto.password);
    const { useCase, prisma } = buildUseCase();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      officeId: 'office-1',
      name: 'Admin',
      email: dto.email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const result = await useCase.execute(dto);

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe(dto.email);
  });

  it('rejeita quando o usuário não existe', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita quando o usuário está inativo', async () => {
    const passwordHash = await argon2.hash(dto.password);
    const { useCase, prisma } = buildUseCase();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      officeId: 'office-1',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: false,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('rejeita quando a senha está incorreta', async () => {
    const passwordHash = await argon2.hash('OutraSenha@123');
    const { useCase, prisma } = buildUseCase();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      officeId: 'office-1',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });
});
