import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../../db.js";
import {
  CreateProductRequest,
  UpdateProductRequest,
  type ProductDTO,
} from "../../http/dto.js";
import {
  buildMeta,
  PaginationQuery,
  skipTake,
  type Paginated,
  type Single,
} from "../../http/pagination.js";
import { notFound } from "../../http/errors.js";

type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDTO(row: ProductRow): ProductDTO {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    priceCents: row.priceCents,
    stock: row.stock,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const products = new Hono();

products.get("/", zValidator("query", PaginationQuery), async (c) => {
  const q = c.req.valid("query");
  const { skip, take } = skipTake(q);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.product.count(),
  ]);
  const body: Paginated<ProductDTO> = {
    data: rows.map(toDTO),
    pagination: buildMeta(q.page, q.pageSize, total),
  };
  return c.json(body);
});

products.post("/", zValidator("json", CreateProductRequest), async (c) => {
  const input = c.req.valid("json");
  const row = await prisma.product.create({
    data: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      priceCents: input.priceCents,
      stock: input.stock,
      imageUrl: input.imageUrl ?? null,
      categoryId: input.categoryId ?? null,
    },
  });
  const body: Single<ProductDTO> = { data: toDTO(row) };
  return c.json(body, 201);
});

products.get("/:id", async (c) => {
  const row = await prisma.product.findUnique({
    where: { id: c.req.param("id") },
  });
  if (!row) throw notFound("product");
  const body: Single<ProductDTO> = { data: toDTO(row) };
  return c.json(body);
});

products.patch("/:id", zValidator("json", UpdateProductRequest), async (c) => {
  const id = c.req.param("id");
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw notFound("product");
  const input = c.req.valid("json");
  const row = await prisma.product.update({
    where: { id },
    data: {
      name: input.name ?? undefined,
      priceCents: input.priceCents ?? undefined,
      stock: input.stock ?? undefined,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl,
      categoryId: input.categoryId === undefined ? undefined : input.categoryId,
    },
  });
  const body: Single<ProductDTO> = { data: toDTO(row) };
  return c.json(body);
});
