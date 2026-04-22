import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductInventoryResponseDto {
  @ApiProperty({ example: '8a78d3d4-22a8-4fe9-a2d2-a7f8fd6f6f9d' })
  id!: string;

  @ApiProperty({ example: 'd6f0c3f1-4dd2-4d7d-9b04-52b3f4d74de0' })
  productId!: string;

  @ApiProperty({ example: 125 })
  stock!: number;

  @ApiProperty({ example: '2026-04-21T12:30:00.000Z' })
  updatedAt!: Date;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'd6f0c3f1-4dd2-4d7d-9b04-52b3f4d74de0' })
  id!: string;

  @ApiProperty({ example: 'Arroz Premium' })
  name!: string;

  @ApiPropertyOptional({ example: 'Arroz blanco de grano largo' })
  description?: string | null;

  @ApiProperty({ example: 'ARROZ-001' })
  sku!: string;

  @ApiProperty({ example: 25.5 })
  purchasePrice!: number;

  @ApiProperty({ example: 32 })
  salePrice!: number;

  @ApiProperty({ example: 'UNIT' })
  unitType!: string;

  @ApiProperty({ example: '2026-04-21T12:30:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({
    type: () => ProductInventoryResponseDto,
    nullable: true,
  })
  inventory?: ProductInventoryResponseDto | null;
}
