import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Client, UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { ClientsService } from '../application/services/clients.service';
import { CreateClientDto } from '../application/dto/create-client.dto';
import { UpdateClientDto } from '../application/dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('companies/:companyId/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  list(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Client[]> {
    return this.clientsService.listForCompany(companyId, currentUser.officeId);
  }

  @Get(':id')
  get(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.getForCompany(id, companyId, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('CREATE', 'Client')
  @Post()
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateClientDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.create(companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('UPDATE', 'Client')
  @Patch(':id')
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Client> {
    return this.clientsService.update(id, companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('DELETE', 'Client')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.clientsService.remove(id, companyId, currentUser.officeId);
  }
}
