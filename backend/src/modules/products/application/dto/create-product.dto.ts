import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Produto Exemplo' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: '61091000' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ncm?: string;

  @ApiPropertyOptional({ example: '5102' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cfop?: string;

  @ApiPropertyOptional({ example: '060' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cst?: string;

  @ApiPropertyOptional({
    description: 'Alíquotas fiscais flexíveis (ICMS, IPI, PIS, COFINS etc.)',
    example: { icms: 18, ipi: 5 },
  })
  @IsOptional()
  @IsObject()
  aliquotas?: Record<string, unknown>;

  @ApiProperty({ example: 99.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'Eletrônicos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
