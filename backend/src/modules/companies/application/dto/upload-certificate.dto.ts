import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Upload sem multipart nesta sprint — o arquivo .pfx chega em base64 dentro do JSON.
 * Multipart real (multer) fica para quando o frontend ganhar a tela de upload.
 */
export class UploadCertificateDto {
  @ApiProperty({ description: 'Conteúdo do arquivo .pfx/.p12 codificado em base64' })
  @IsString()
  @MinLength(1)
  fileBase64!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
