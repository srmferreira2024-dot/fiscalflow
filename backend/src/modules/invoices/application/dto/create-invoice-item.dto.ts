import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/**
 * A regra "exatamente um entre productId e serviceItemId" é validada em
 * InvoicesService.emitirNota — class-validator com @IsOptional() em ambos os campos
 * não consegue expressar XOR de forma confiável (o validador do campo A é pulado
 * quando A está ausente, mesmo que B também esteja ausente).
 */
export class CreateInvoiceItemDto {
  @ApiPropertyOptional({ description: 'Se omitido, usa o nome do Produto/Serviço referenciado' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001, { message: 'Informe uma quantidade maior que zero' })
  quantidade!: number;

  @ApiProperty({ example: 100 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorUnitario!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceItemId?: string;
}
