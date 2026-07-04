import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { User } from '@prisma/client';
import { UsersRepository } from '../../infrastructure/users.repository';
import { InviteUserDto } from '../dto/invite-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PrismaService } from '../../../../infra/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async listForOffice(officeId: string): Promise<User[]> {
    return this.usersRepository.findAllByOffice(officeId);
  }

  async getForOffice(id: string, officeId: string): Promise<User> {
    const user = await this.usersRepository.findByIdAndOffice(id, officeId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async inviteUser(officeId: string, dto: InviteUserDto): Promise<User> {

    const existing = await this.usersRepository.findByEmailAndOffice(dto.email, officeId);
    if (existing) {
      throw new BadRequestException('Email já registrado neste escritório');
    }

    const tempPassword = Math.random().toString(36).slice(-12);
    const passwordHash = await hash(tempPassword);

    const user = await this.usersRepository.create(officeId, {
      name: dto.name,
      email: dto.email,
      role: dto.role,
      passwordHash,
    });

    return user;
  }

  async updateUser(id: string, officeId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getForOffice(id, officeId);

    const updated = await this.usersRepository.updateByIdAndOffice(id, officeId, dto);
    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return updated;
  }

  async deactivateUser(id: string, officeId: string): Promise<User> {
    const user = await this.getForOffice(id, officeId);

    const updated = await this.usersRepository.updateByIdAndOffice(id, officeId, {
      isActive: false,
    });
    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return updated;
  }
}
