import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Arroz Premium',
    minLength: 2,
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional({
    example: 'Arroz blanco de grano largo',
    minLength: 2,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(2, 500)
  description?: string;

  @ApiPropertyOptional({
    example: 'ARROZ-001',
    minLength: 3,
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @Length(3, 40)
  @Matches(/^[A-Z0-9-_]+$/i, {
    message: 'sku must contain only letters, numbers, hyphens, and underscores',
  })
  sku?: string;

  @ApiPropertyOptional({
    example: 25.5,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({
    example: 32.0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({
    example: 'UNIT',
  })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  unitType?: string;
}
