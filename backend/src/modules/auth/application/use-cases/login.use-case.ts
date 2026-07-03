import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResult } from '../dto/auth-result';
import { TokenService } from '../services/token.service';
import { Email } from '../../../../common/value-objects/email.vo';

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResult> {
    const email = Email.create(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      officeId: user.officeId,
      email: user.email,
      role: user.role,
    });
    const refresh = this.tokenService.issueRefreshToken();

    await this.prisma.$transaction([
      this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refresh.tokenHash,
          expiresAt: refresh.expiresAt,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
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
      refreshToken: refresh.token,
    };
  }
}
