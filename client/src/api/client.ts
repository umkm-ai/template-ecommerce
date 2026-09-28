export interface ProductDTO {
  id: string;
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

const BASE = "/api";

export async function listProducts(page = 1): Promise<Paginated<ProductDTO>> {
  const res = await fetch(`${BASE}/products?page=${page}`);
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return (await res.json()) as Paginated<ProductDTO>;
}
