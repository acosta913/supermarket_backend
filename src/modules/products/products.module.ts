import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/auth/guards/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { PRODUCT_REPOSITORY } from './products.tokens';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    RolesGuard,
  ],
})
export class ProductsModule {}
