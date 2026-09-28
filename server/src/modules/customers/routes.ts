import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../../db.js";
import { CreateCustomerRequest, type CustomerDTO } from "../../http/dto.js";
import {
  buildMeta,
  PaginationQuery,
  skipTake,
  type Paginated,
  type Single,
} from "../../http/pagination.js";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toDTO(row: CustomerRow): CustomerDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const customers = new Hono();

customers.get("/", zValidator("query", PaginationQuery), async (c) => {
  const q = c.req.valid("query");
  const { skip, take } = skipTake(q);
  const [rows, total] = await Promise.all([
    prisma.customer.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.customer.count(),
  ]);
  const body: Paginated<CustomerDTO> = {
    data: rows.map(toDTO),
    pagination: buildMeta(q.page, q.pageSize, total),
  };
  return c.json(body);
});

customers.post("/", zValidator("json", CreateCustomerRequest), async (c) => {
  const input = c.req.valid("json");
  const row = await prisma.customer.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
    },
  });
  const body: Single<CustomerDTO> = { data: toDTO(row) };
  return c.json(body, 201);
});
