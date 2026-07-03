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
import { ServiceItem, UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { ServiceItemsService } from '../application/services/service-items.service';
import { CreateServiceItemDto } from '../application/dto/create-service-item.dto';
import { UpdateServiceItemDto } from '../application/dto/update-service-item.dto';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('companies/:companyId/services')
export class ServiceItemsController {
  constructor(private readonly serviceItemsService: ServiceItemsService) {}

  @Get()
  list(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ServiceItem[]> {
    return this.serviceItemsService.listForCompany(companyId, currentUser.officeId);
  }

  @Get(':id')
  get(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ServiceItem> {
    return this.serviceItemsService.getForCompany(id, companyId, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('CREATE', 'ServiceItem')
  @Post()
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateServiceItemDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ServiceItem> {
    return this.serviceItemsService.create(companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('UPDATE', 'ServiceItem')
  @Patch(':id')
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceItemDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ServiceItem> {
    return this.serviceItemsService.update(id, companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('DELETE', 'ServiceItem')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.serviceItemsService.remove(id, companyId, currentUser.officeId);
  }
}
