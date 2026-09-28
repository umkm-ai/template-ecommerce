# Ecommerce — UMKM Template

A production-ready **ecommerce** starter for Indonesian UMKM, generated and
hosted by [Warung](https://github.com/umkm-ai).

- **Server:** Bun + [Hono](https://hono.dev) + [Prisma](https://www.prisma.io) + PostgreSQL
- **Client:** Vite + React + TypeScript
- **Language/locale:** Bahasa Indonesia, IDR

## Features

- Products, categories, and customers
- Orders with line items, stock validation, and status workflow
- Fully typed request/response DTOs (zod) — no `any`
- Consistent pagination on all list endpoints

## Structure

```text
template-ecommerce/
├─ server/   # Hono + Prisma API (Bun)
└─ client/   # Vite + React SPA
```

## Quick start (server)

```bash
cd server
bun install
cp .env.example .env          # set DATABASE_URL
bunx prisma migrate deploy
bun run prisma/seed.ts
bun run src/index.ts          # http://localhost:3000
```

## Quick start (client)

```bash
cd client
bun install
bun run dev                   # http://localhost:5173
```

## API

Base URL `/api`. Health at `/healthz`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products (paginated) |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product |
| PATCH | `/api/products/:id` | Update product |
| GET | `/api/categories` | List categories (paginated) |
| POST | `/api/categories` | Create category |
| GET | `/api/customers` | List customers (paginated) |
| POST | `/api/customers` | Create customer |
| GET | `/api/orders` | List orders (paginated) |
| POST | `/api/orders` | Create order (validates + decrements stock) |
| GET | `/api/orders/:id` | Get order |
| PATCH | `/api/orders/:id/status` | Update order status |

License: MIT.
