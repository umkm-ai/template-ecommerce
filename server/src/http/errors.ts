import type { Context } from "hono";
import { ZodError } from "zod";

/** Typed error envelope used across the API (docs/TEMPLATES.md §4). */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what: string): ApiError =>
  new ApiError(404, "not_found", `${what} not found`);

export const badRequest = (message: string, details?: unknown): ApiError =>
  new ApiError(400, "bad_request", message, details);

export const conflict = (message: string): ApiError =>
  new ApiError(409, "conflict", message);

/** Central error handler mapping thrown errors to the typed envelope. */
export function handleError(err: unknown, c: Context): Response {
  if (err instanceof ApiError) {
    const body: ApiErrorBody = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    return c.json(body, err.status as 400 | 404 | 409 | 500);
  }
  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      error: {
        code: "validation_error",
        message: "request validation failed",
        details: err.issues,
      },
    };
    return c.json(body, 400);
  }
  const body: ApiErrorBody = {
    error: { code: "internal_error", message: "internal server error" },
  };
  return c.json(body, 500);
}
