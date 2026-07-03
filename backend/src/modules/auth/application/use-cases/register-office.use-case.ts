import { ConflictException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../../infra/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthResult } from '../dto/auth-result';
import { TokenService } from '../services/token.service';
import { Email } from '../../../../common/value-objects/email.vo';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class RegisterOfficeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResult> {
    const email = Email.create(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });

    if (existingUser) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
    }

    const baseSlug = slugify(dto.officeName) || 'escritorio';
    const slug = await this.buildUniqueSlug(baseSlug);
    const passwordHash = await argon2.hash(dto.password);

    const { office, user } = await this.prisma.$transaction(async (tx) => {
      const office = await tx.office.create({
        data: { name: dto.officeName, slug },
      });

      const user = await tx.user.create({
        data: {
          officeId: office.id,
          name: dto.userName,
          email: email.toString(),
          passwordHash,
          role: UserRole.ADMIN,
        },
      });

      return { office, user };
    });

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      officeId: office.id,
      email: user.email,
      role: user.role,
    });
    const refresh = this.tokenService.issueRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refresh.tokenHash,
        expiresAt: refresh.expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        officeId: office.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken: refresh.token,
    };
  }

  private async buildUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;

    while (await this.prisma.office.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}
