import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { buildPaginationMeta } from '../../common/utils/pagination.util';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import {
  ProductInventoryResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './domain/entities/product.entity';
import {
  ProductRepositoryPort,
  UpdateProductInput,
} from './domain/ports/product-repository.port';
import { PRODUCT_REPOSITORY } from './products.tokens';

type FindAllProductsResponse = {
  data: ProductResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const createdProduct = await this.repository.create(this.toCreateData(dto));
    return this.toProductResponse(createdProduct);
  }

  async findAll(query: FindProductsQueryDto): Promise<FindAllProductsResponse> {
    const result = await this.repository.findAll(query);

    return {
      data: result.items.map((product) => this.toProductResponse(product)),
      meta: buildPaginationMeta(result.page, result.limit, result.total),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found`);
    }

    return this.toProductResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const updatedProduct = await this.repository.update(
      id,
      this.toUpdateData(dto),
    );
    return this.toProductResponse(updatedProduct);
  }

  async remove(id: string): Promise<ProductResponseDto> {
    const deletedProduct = await this.repository.delete(id);
    return this.toProductResponse(deletedProduct);
  }

  private toProductResponse(product: ProductEntity): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      unitType: product.unitType,
      createdAt: product.createdAt,
      inventory: product.inventory
        ? ({
            id: product.inventory.id,
            productId: product.inventory.productId,
            stock: product.inventory.stock,
            updatedAt: product.inventory.updatedAt,
          } satisfies ProductInventoryResponseDto)
        : null,
    };
  }

  private toCreateData(dto: CreateProductDto) {
    return {
      name: dto.name.trim(),
      description: dto.description?.trim(),
      sku: dto.sku.trim().toUpperCase(),
      purchasePrice: dto.purchasePrice,
      salePrice: dto.salePrice,
      unitType: dto.unitType.trim().toUpperCase(),
    };
  }

  private toUpdateData(dto: UpdateProductDto): UpdateProductInput {
    const data: UpdateProductInput = {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.description !== undefined && {
        description: dto.description.trim(),
      }),
      ...(dto.sku !== undefined && { sku: dto.sku.trim().toUpperCase() }),
      ...(dto.purchasePrice !== undefined && {
        purchasePrice: dto.purchasePrice,
      }),
      ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
      ...(dto.unitType !== undefined && {
        unitType: dto.unitType.trim().toUpperCase(),
      }),
    };
    return data;
  }
}
