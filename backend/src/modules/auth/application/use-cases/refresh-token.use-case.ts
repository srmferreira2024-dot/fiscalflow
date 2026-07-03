import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthResult } from '../dto/auth-result';
import { TokenService } from '../services/token.service';

const INVALID_TOKEN_MESSAGE = 'Refresh token inválido ou expirado';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthResult> {
    const tokenHash = this.tokenService.hashRefreshToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    const { user } = storedToken;
    if (!user.isActive) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    const newRefresh = this.tokenService.issueRefreshToken();
    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      officeId: user.officeId,
      email: user.email,
      role: user.role,
    });

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newRefresh.tokenHash,
          expiresAt: newRefresh.expiresAt,
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        officeId: user.officeId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken: newRefresh.token,
    };
  }
}
