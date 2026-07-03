import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Invoice, UserRole } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { InvoicesService } from '../application/services/invoices.service';
import { CreateInvoiceDto } from '../application/dto/create-invoice.dto';
import { CancelInvoiceDto } from '../application/dto/cancel-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('companies/:companyId/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  list(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice[]> {
    return this.invoicesService.listForCompany(companyId, currentUser.officeId);
  }

  @Get(':id')
  get(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.getForCompany(id, companyId, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('EMITIR', 'Invoice')
  @Post()
  emitir(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.emitirNota(companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('REEMITIR', 'Invoice')
  @Post(':id/reemitir')
  reemitir(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.reemitirNota(id, companyId, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('CANCELAR', 'Invoice')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancelar')
  cancelar(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelInvoiceDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    return this.invoicesService.cancelarNota(id, companyId, currentUser.officeId, dto);
  }

  @Get(':id/xml')
  async baixarXML(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const xml = await this.invoicesService.baixarXML(id, companyId, currentUser.officeId);
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Get(':id/pdf')
  async baixarPDF(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const pdf = await this.invoicesService.baixarPDF(id, companyId, currentUser.officeId);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  }
}
