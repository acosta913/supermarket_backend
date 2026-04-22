import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Acosta' })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({ example: 'ana@supermarket.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'CAJERO', 'INVENTARIO'] })
  @IsString()
  @IsIn(['ADMIN', 'CAJERO', 'INVENTARIO'])
  role!: string;
}
