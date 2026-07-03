import { Body, Controller, Get, NotFoundException, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.interface';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { UpdateOfficeDto } from '../application/dto/update-office.dto';

@ApiTags('offices')
@ApiBearerAuth()
@Controller('offices')
export class OfficesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    const office = await this.prisma.office.findUnique({
      where: { id: currentUser.officeId },
    });

    if (!office) {
      throw new NotFoundException('Escritório não encontrado');
    }

    return office;
  }

  @Roles(UserRole.ADMIN)
  @Audit('UPDATE', 'Office')
  @Patch('me')
  async update(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: UpdateOfficeDto) {
    return this.prisma.office.update({
      where: { id: currentUser.officeId },
      data: dto,
    });
  }
}
