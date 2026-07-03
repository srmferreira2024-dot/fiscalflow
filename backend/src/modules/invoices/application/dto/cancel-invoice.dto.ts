import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CancelInvoiceDto {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: 'Informe o motivo do cancelamento' })
  motivo!: string;
}
