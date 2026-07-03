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
import { Product, UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { ProductsService } from '../application/services/products.service';
import { CreateProductDto } from '../application/dto/create-product.dto';
import { UpdateProductDto } from '../application/dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(TenantGuard)
@Controller('companies/:companyId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Product[]> {
    return this.productsService.listForCompany(companyId, currentUser.officeId);
  }

  @Get(':id')
  get(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.getForCompany(id, companyId, currentUser.officeId);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('CREATE', 'Product')
  @Post()
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateProductDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.create(companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR, UserRole.OPERADOR)
  @Audit('UPDATE', 'Product')
  @Patch(':id')
  update(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.update(id, companyId, currentUser.officeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.CONTADOR)
  @Audit('DELETE', 'Product')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    return this.productsService.remove(id, companyId, currentUser.officeId);
  }
}
