import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizePagination } from '../../../../common/utils/pagination.util';
import { throwMappedPrismaError } from '../../../../common/utils/prisma-error.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { FindProductsQueryDto } from '../../dto/find-products-query.dto';
import { ProductEntity } from '../../domain/entities/product.entity';
import {
  CreateProductInput,
  FindProductsResult,
  ProductRepositoryPort,
  UpdateProductInput,
} from '../../domain/ports/product-repository.port';

const productWithInventoryInclude = Prisma.validator<Prisma.ProductInclude>()({
  inventory: true,
});

type ProductWithInventory = Prisma.ProductGetPayload<{
  include: typeof productWithInventoryInclude;
}>;

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductInput): Promise<ProductEntity> {
    try {
      const created = await this.prisma.product.create({
        data,
        include: productWithInventoryInclude,
      });
      return this.toEntity(created);
    } catch (error: unknown) {
      throwMappedPrismaError(error, data.sku);
    }
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productWithInventoryInclude,
    });

    return product ? this.toEntity(product) : null;
  }

  async findAll(query: FindProductsQueryDto): Promise<FindProductsResult> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const order = query.order ?? 'desc';

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productWithInventoryInclude,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products.map((product) => this.toEntity(product)),
      total,
      page,
      limit,
    };
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductEntity> {
    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data,
        include: productWithInventoryInclude,
      });
      return this.toEntity(updated);
    } catch (error: unknown) {
      throwMappedPrismaError(error, data.sku);
    }
  }

  async delete(id: string): Promise<ProductEntity> {
    try {
      const deleted = await this.prisma.product.delete({
        where: { id },
        include: productWithInventoryInclude,
      });
      return this.toEntity(deleted);
    } catch (error: unknown) {
      throwMappedPrismaError(error);
    }
  }

  private toEntity(product: ProductWithInventory): ProductEntity {
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
        ? {
            id: product.inventory.id,
            productId: product.inventory.productId,
            stock: product.inventory.stock,
            updatedAt: product.inventory.updatedAt,
          }
        : null,
    };
  }
}
