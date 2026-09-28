import { z } from "zod";
import { PaginationMeta } from "./pagination.js";

/**
 * Request and response DTOs for the Ecommerce API. Every field is typed via
 * zod — no `any`, no untyped bags. See docs/TEMPLATES.md §4.
 */

export const OrderStatus = z.enum([
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

/* ---------- Category ---------- */

export const CategoryDTO = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoryDTO = z.infer<typeof CategoryDTO>;

export const CreateCategoryRequest = z.object({
  name: z.string().min(1).max(80),
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequest>;

/* ---------- Product ---------- */

export const ProductDTO = z.object({
  id: z.string(),
  slug: z.string(),
  sku: z.string(),
  name: z.string(),
  priceCents: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ProductDTO = z.infer<typeof ProductDTO>;

export const CreateProductRequest = z.object({
  slug: z.string().min(1).max(120),
  sku: z.string().min(1).max(64),
  name: z.string().min(1).max(160),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequest>;

export const UpdateProductRequest = z.object({
  name: z.string().min(1).max(160).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});
export type UpdateProductRequest = z.infer<typeof UpdateProductRequest>;

/* ---------- Customer ---------- */

export const CustomerDTO = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CustomerDTO = z.infer<typeof CustomerDTO>;

export const CreateCustomerRequest = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(1).max(32).nullable().optional(),
});
export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequest>;

/* ---------- Order ---------- */

export const OrderItemDTO = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  unitPriceCents: z.number().int(),
  lineTotalCents: z.number().int(),
});
export type OrderItemDTO = z.infer<typeof OrderItemDTO>;

export const OrderDTO = z.object({
  id: z.string(),
  status: OrderStatus,
  totalCents: z.number().int(),
  customerId: z.string(),
  createdAt: z.string(),
  items: z.array(OrderItemDTO),
});
export type OrderDTO = z.infer<typeof OrderDTO>;

export const CreateOrderItemRequest = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export const CreateOrderRequest = z.object({
  customerId: z.string().min(1),
  items: z.array(CreateOrderItemRequest).min(1),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequest>;

export const UpdateOrderStatusRequest = z.object({
  status: OrderStatus,
});
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequest>;

/* ---------- Response envelopes ---------- */

export const PaginatedProducts = z.object({
  data: z.array(ProductDTO),
  pagination: PaginationMeta,
});
export const PaginatedCategories = z.object({
  data: z.array(CategoryDTO),
  pagination: PaginationMeta,
});
export const PaginatedCustomers = z.object({
  data: z.array(CustomerDTO),
  pagination: PaginationMeta,
});
export const PaginatedOrders = z.object({
  data: z.array(OrderDTO),
  pagination: PaginationMeta,
});
