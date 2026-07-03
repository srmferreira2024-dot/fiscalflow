import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { AppConfig } from '../../../../config/configuration';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';

export interface IssuedRefreshToken {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  signAccessToken(payload: AuthenticatedUser): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret', { infer: true }),
      expiresIn: this.configService.get('jwt.accessExpiresIn', { infer: true }),
    });
  }

  issueRefreshToken(): IssuedRefreshToken {
    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashRefreshToken(token);
    const expiresIn = this.configService.get('jwt.refreshExpiresIn', { infer: true });
    const expiresAt = new Date(Date.now() + this.parseExpiresInMs(expiresIn));

    return { token, tokenHash, expiresAt };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiresInMs(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = parseInt(match[1], 10);
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * unitMs[match[2]];
  }
}
