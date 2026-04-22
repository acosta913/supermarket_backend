export type InventoryEntity = {
  id: string;
  productId: string;
  stock: number;
  updatedAt: Date;
};

export type ProductEntity = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  unitType: string;
  createdAt: Date;
  inventory: InventoryEntity | null;
};
