import { z } from "zod";

/** Validated environment for the POS server. */
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const env = EnvSchema.parse({
  DATABASE_URL: Bun.env.DATABASE_URL,
  PORT: Bun.env.PORT,
});
