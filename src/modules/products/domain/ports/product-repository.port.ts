import { FindProductsQueryDto } from '../../dto/find-products-query.dto';
import { ProductEntity } from '../entities/product.entity';

export type CreateProductInput = {
  name: string;
  description?: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  unitType: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type FindProductsResult = {
  items: ProductEntity[];
  total: number;
  page: number;
  limit: number;
};

export interface ProductRepositoryPort {
  create(data: CreateProductInput): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findAll(query: FindProductsQueryDto): Promise<FindProductsResult>;
  update(id: string, data: UpdateProductInput): Promise<ProductEntity>;
  delete(id: string): Promise<ProductEntity>;
}
