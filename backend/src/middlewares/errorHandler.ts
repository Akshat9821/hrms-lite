import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors/ApiError";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

function isPrismaKnownRequestError(err: unknown): err is {
  code: string;
  meta?: unknown;
  name: string;
} {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as any).code === "string" &&
    "name" in err &&
    typeof (err as any).name === "string" &&
    (err as any).name === "PrismaClientKnownRequestError"
  );
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
) {
  // Zod (input validation)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid request body",
        details: err.flatten(),
      },
    });
  }

  // App-defined errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Prisma errors -> map to HTTP semantics
  if (isPrismaKnownRequestError(err)) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "DUPLICATE",
          message: "Duplicate resource",
          details: (err as any).meta,
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
          details: (err as any).meta,
        },
      });
    }
  }

  // Fallback
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
}

