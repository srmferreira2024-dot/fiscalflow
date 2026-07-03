import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'contador@escritorio.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'João Contador' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ enum: Object.values(UserRole), example: 'CONTADOR' })
  @IsEnum(UserRole)
  role!: UserRole;
}
