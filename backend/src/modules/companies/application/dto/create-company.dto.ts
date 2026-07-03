import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxRegime } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: '11222333000181' })
  @IsString()
  @MinLength(11)
  @MaxLength(18)
  cnpj!: string;

  @ApiProperty({ example: 'Empresa Exemplo LTDA' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  razaoSocial!: string;

  @ApiPropertyOptional({ example: 'Empresa Exemplo' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nomeFantasia?: string;

  @ApiPropertyOptional({ enum: TaxRegime })
  @IsOptional()
  @IsEnum(TaxRegime)
  regimeTributario?: TaxRegime;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  inscricaoEstadual?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  inscricaoMunicipal?: string;

  @ApiPropertyOptional({ example: '6201-5/01' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnae?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  municipio?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Configurações fiscais flexíveis (série de nota, ambiente etc.)',
  })
  @IsOptional()
  @IsObject()
  fiscalSettings?: Record<string, unknown>;
}
