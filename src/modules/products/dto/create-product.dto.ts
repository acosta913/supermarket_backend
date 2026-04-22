import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Arroz Premium',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Arroz blanco de grano largo',
    minLength: 2,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(2, 500)
  description?: string;

  @ApiProperty({
    example: 'ARROZ-001',
    minLength: 3,
    maxLength: 40,
  })
  @IsString()
  @Length(3, 40)
  @Matches(/^[A-Z0-9-_]+$/i, {
    message: 'sku must contain only letters, numbers, hyphens, and underscores',
  })
  sku!: string;

  @ApiProperty({
    example: 25.5,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({
    example: 32.0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiProperty({
    example: 'UNIT',
  })
  @IsString()
  @Length(1, 30)
  unitType!: string;
}
