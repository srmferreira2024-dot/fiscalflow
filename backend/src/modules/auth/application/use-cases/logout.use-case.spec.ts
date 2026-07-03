import { LogoutUseCase } from './logout.use-case';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { TokenService } from '../services/token.service';

describe('LogoutUseCase', () => {
  it('revoga o refresh token informado', async () => {
    const prisma = {
      refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    } as unknown as PrismaService;
    const tokenService = {
      hashRefreshToken: jest.fn().mockReturnValue('hashed-token'),
    } as unknown as TokenService;

    const useCase = new LogoutUseCase(prisma, tokenService);
    await useCase.execute('raw-token');

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: 'hashed-token', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
