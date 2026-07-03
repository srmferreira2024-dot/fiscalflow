import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@escritorio.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaForte@123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
