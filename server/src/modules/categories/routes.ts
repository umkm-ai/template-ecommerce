import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../../db.js";
import { CreateCategoryRequest, type CategoryDTO } from "../../http/dto.js";
import {
  buildMeta,
  PaginationQuery,
  skipTake,
  type Paginated,
  type Single,
} from "../../http/pagination.js";

type CategoryRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toDTO(row: CategoryRow): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const categories = new Hono();

categories.get("/", zValidator("query", PaginationQuery), async (c) => {
  const q = c.req.valid("query");
  const { skip, take } = skipTake(q);
  const [rows, total] = await Promise.all([
    prisma.category.findMany({ skip, take, orderBy: { name: "asc" } }),
    prisma.category.count(),
  ]);
  const body: Paginated<CategoryDTO> = {
    data: rows.map(toDTO),
    pagination: buildMeta(q.page, q.pageSize, total),
  };
  return c.json(body);
});

categories.post("/", zValidator("json", CreateCategoryRequest), async (c) => {
  const input = c.req.valid("json");
  const row = await prisma.category.create({ data: { name: input.name } });
  const body: Single<CategoryDTO> = { data: toDTO(row) };
  return c.json(body, 201);
});
