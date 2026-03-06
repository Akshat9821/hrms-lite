import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(
    new ApiError({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Route not found",
    }),
  );
}

