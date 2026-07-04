import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByOffice(officeId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { officeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdAndOffice(id: string, officeId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, officeId },
    });
  }

  findByEmailAndOffice(email: string, officeId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, officeId },
    });
  }

  async create(
    officeId: string,
    input: Omit<Prisma.UserCreateInput, 'office'> & { office?: never },
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        officeId,
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash: input.passwordHash,
      },
    });
  }

  async updateByIdAndOffice(
    id: string,
    officeId: string,
    input: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    const result = await this.prisma.user.updateMany({
      where: { id, officeId },
      data: input,
    });

    if (result.count === 0) {
      return null;
    }

    return this.prisma.user.findFirst({ where: { id, officeId } });
  }

  async deleteByIdAndOffice(id: string, officeId: string): Promise<boolean> {
    const result = await this.prisma.user.deleteMany({
      where: { id, officeId },
    });
    return result.count > 0;
  }
}
