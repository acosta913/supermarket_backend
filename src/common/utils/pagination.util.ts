export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function normalizePagination(
  page?: number,
  limit?: number,
  maxLimit = 100,
): { page: number; limit: number; skip: number } {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(Math.max(1, limit ?? 20), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
