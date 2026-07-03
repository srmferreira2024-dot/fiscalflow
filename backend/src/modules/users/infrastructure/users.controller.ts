import { Controller, Get, Post, Patch, Delete, NotFoundException, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { UsersService } from '../application/services/users.service';
import { UserView } from '../application/user-view';
import { InviteUserDto } from '../application/dto/invite-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(TenantGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser): Promise<UserView> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      officeId: user.officeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  @Get('offices/:officeId/users')
  @Roles('ADMIN', 'CONTADOR')
  async list(
    @Param('officeId') officeId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserView[]> {
    const users = await this.usersService.listForOffice(officeId);
    return users.map((u) => ({
      id: u.id,
      officeId: u.officeId,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
    }));
  }

  @Get('offices/:officeId/users/:id')
  @Roles('ADMIN', 'CONTADOR')
  async get(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ): Promise<UserView> {
    const user = await this.usersService.getForOffice(id, officeId);
    return {
      id: user.id,
      officeId: user.officeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  @Post('offices/:officeId/users/invite')
  @Roles('ADMIN')
  @Audit('INVITE', 'User')
  async invite(
    @Param('officeId') officeId: string,
    @Body() dto: InviteUserDto,
  ): Promise<UserView> {
    const user = await this.usersService.inviteUser(officeId, dto);
    return {
      id: user.id,
      officeId: user.officeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  @Patch('offices/:officeId/users/:id')
  @Roles('ADMIN')
  @Audit('UPDATE', 'User')
  async update(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserView> {
    const user = await this.usersService.updateUser(id, officeId, dto);
    return {
      id: user.id,
      officeId: user.officeId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  @Delete('offices/:officeId/users/:id')
  @Roles('ADMIN')
  @Audit('DELETE', 'User')
  async delete(@Param('officeId') officeId: string, @Param('id') id: string): Promise<void> {
    await this.usersService.getForOffice(id, officeId);
    await this.usersService.deactivateUser(id, officeId);
  }
}
