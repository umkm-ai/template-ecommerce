import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../../db.js";
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  type OrderDTO,
} from "../../http/dto.js";
import {
  buildMeta,
  PaginationQuery,
  skipTake,
  type Paginated,
  type Single,
} from "../../http/pagination.js";
import { badRequest, notFound } from "../../http/errors.js";

type OrderItemRow = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};
type OrderRow = {
  id: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  totalCents: number;
  customerId: string;
  createdAt: Date;
  items: OrderItemRow[];
};

function toDTO(row: OrderRow): OrderDTO {
  return {
    id: row.id,
    status: row.status,
    totalCents: row.totalCents,
    customerId: row.customerId,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
      lineTotalCents: it.lineTotalCents,
    })),
  };
}

export const orders = new Hono();

orders.get("/", zValidator("query", PaginationQuery), async (c) => {
  const q = c.req.valid("query");
  const { skip, take } = skipTake(q);
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.count(),
  ]);
  const body: Paginated<OrderDTO> = {
    data: rows.map(toDTO),
    pagination: buildMeta(q.page, q.pageSize, total),
  };
  return c.json(body);
});

orders.get("/:id", async (c) => {
  const row = await prisma.order.findUnique({
    where: { id: c.req.param("id") },
    include: { items: true },
  });
  if (!row) throw notFound("order");
  const body: Single<OrderDTO> = { data: toDTO(row) };
  return c.json(body);
});

orders.post("/", zValidator("json", CreateOrderRequest), async (c) => {
  const input = c.req.valid("json");

  const created = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) throw notFound(`customer ${input.customerId}`);

    const ids = input.items.map((i) => i.productId);
    const found = await tx.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(found.map((p) => [p.id, p]));

    let totalCents = 0;
    const itemsData = input.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw notFound(`product ${item.productId}`);
      if (product.stock < item.quantity) {
        throw badRequest(`insufficient stock for ${product.name}`, {
          productId: product.id,
          available: product.stock,
          requested: item.quantity,
        });
      }
      const lineTotalCents = product.priceCents * item.quantity;
      totalCents += lineTotalCents;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents,
      };
    });

    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.create({
      data: {
        status: "pending",
        totalCents,
        customerId: input.customerId,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  });

  const body: Single<OrderDTO> = { data: toDTO(created) };
  return c.json(body, 201);
});

orders.patch(
  "/:id/status",
  zValidator("json", UpdateOrderStatusRequest),
  async (c) => {
    const id = c.req.param("id");
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw notFound("order");
    const input = c.req.valid("json");
    const row = await prisma.order.update({
      where: { id },
      data: { status: input.status },
      include: { items: true },
    });
    const body: Single<OrderDTO> = { data: toDTO(row) };
    return c.json(body);
  },
);
