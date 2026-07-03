import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Escritório Contábil Exemplo' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  officeName!: string;

  @ApiProperty({ example: 'Maria Contadora' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  userName!: string;

  @ApiProperty({ example: 'admin@escritorio.com.br' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaForte@123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve conter letra maiúscula, minúscula e número',
  })
  password!: string;
}
