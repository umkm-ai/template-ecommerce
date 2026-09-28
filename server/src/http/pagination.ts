import { z } from "zod";

/**
 * Shared pagination contract for all list endpoints (docs/TEMPLATES.md §4).
 * Page-based pagination with typed metadata — never ad-hoc fields.
 */

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const PaginationMeta = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});
export type PaginationMeta = z.infer<typeof PaginationMeta>;

export function buildMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function skipTake(q: PaginationQuery): { skip: number; take: number } {
  return { skip: (q.page - 1) * q.pageSize, take: q.pageSize };
}

/** Typed list envelope: `{ data, pagination }`. */
export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Typed single-item envelope: `{ data }`. */
export interface Single<T> {
  data: T;
}
