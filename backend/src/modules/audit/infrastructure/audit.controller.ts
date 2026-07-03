import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from '../application/services/audit.service';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(TenantGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('offices/:officeId/logs')
  @Roles('ADMIN', 'CONTADOR')
  async listLogs(
    @Param('officeId') officeId: string,
    @Query('skip') skip = 0,
    @Query('take') take = 50,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
  ) {
    return this.auditService.listLogs(officeId, {
      skip: parseInt(skip as any) || 0,
      take: Math.min(parseInt(take as any) || 50, 100),
      action,
      entity,
    });
  }
}
