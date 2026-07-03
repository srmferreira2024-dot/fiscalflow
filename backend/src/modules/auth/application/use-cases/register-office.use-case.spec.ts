import { ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RegisterOfficeUseCase } from './register-office.use-case';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { TokenService } from '../services/token.service';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterOfficeUseCase', () => {
  const dto: RegisterDto = {
    officeName: 'Escritório Teste',
    userName: 'Maria Contadora',
    email: 'maria@escritorio.com.br',
    password: 'SenhaForte@123',
  };

  function buildUseCase() {
    const prisma = {
      user: { findUnique: jest.fn(), findUniqueOrThrow: jest.fn() },
      office: { findUnique: jest.fn(), create: jest.fn(), findUniqueOrThrow: jest.fn() },
      refreshToken: { create: jest.fn() },
      $transaction: jest.fn(),
    } as unknown as PrismaService;

    const tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      issueRefreshToken: jest.fn().mockReturnValue({
        token: 'refresh-token',
        tokenHash: 'hashed-refresh-token',
        expiresAt: new Date(),
      }),
    } as unknown as TokenService;

    return { useCase: new RegisterOfficeUseCase(prisma, tokenService), prisma, tokenService };
  }

  it('cria escritório + usuário ADMIN e retorna tokens', async () => {
    const { useCase, prisma } = buildUseCase();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.office.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback: unknown) => {
      const tx = {
        office: {
          create: jest.fn().mockResolvedValue({ id: 'office-1', name: dto.officeName }),
        },
        user: {
          create: jest.fn().mockResolvedValue({
            id: 'user-1',
            name: dto.userName,
            email: dto.email,
            role: UserRole.ADMIN,
          }),
        },
      };
      return (callback as (tx: unknown) => Promise<unknown>)(tx);
    });
    (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

    const result = await useCase.execute(dto);

    expect(result.user.email).toBe(dto.email);
    expect(result.user.role).toBe(UserRole.ADMIN);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('rejeita registro quando já existe usuário com o mesmo e-mail', async () => {
    const { useCase, prisma } = buildUseCase();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });
});
