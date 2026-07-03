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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { CompaniesService } from '../application/services/companies.service';
import { CreateCompanyDto } from '../application/dto/create-company.dto';
import { UpdateCompanyDto } from '../application/dto/update-company.dto';
import { UploadCertificateDto } from '../application/dto/upload-certificate.dto';
import { CompanyView } from '../application/company-view';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(@CurrentUser() currentUser: AuthenticatedUser): Promise<CompanyView[]> {
    return this.companiesService.listForOffice(currentUser.officeId);
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CompanyView> {
    return this.companiesService.getForOffice(id, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('CREATE', 'Company')
  @Post()
  create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CompanyView> {
    return this.companiesService.create(currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('UPDATE', 'Company')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CompanyView> {
    return this.companiesService.update(id, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Audit('DELETE', 'Company')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.companiesService.remove(id, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('UPLOAD_CERTIFICATE', 'Company')
  @Post(':id/certificate')
  uploadCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadCertificateDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<CompanyView> {
    return this.companiesService.uploadCertificate(id, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('REMOVE_CERTIFICATE', 'Company')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/certificate')
  removeCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.companiesService.removeCertificate(id, currentUser.officeId);
  }
}
