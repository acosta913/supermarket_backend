import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function throwMappedPrismaError(error: unknown, sku?: string): never {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException(
        `A product with SKU "${sku ?? 'provided value'}" already exists`,
      );
    }

    if (error.code === 'P2025') {
      throw new NotFoundException('The requested resource was not found');
    }
  }

  throw new InternalServerErrorException('Unexpected database error');
}
