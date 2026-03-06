import { ApiError } from "../errors/ApiError";

export function parseISODateOnly(value: string): Date {
  // Expect YYYY-MM-DD. Store as UTC midnight to avoid timezone drift.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError({
      statusCode: 400,
      code: "BAD_REQUEST",
      message: "date must be in format YYYY-MM-DD",
      details: { field: "date" },
    });
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new ApiError({
      statusCode: 400,
      code: "BAD_REQUEST",
      message: "Invalid date",
      details: { field: "date" },
    });
  }
  return d;
}

export function todayISODateOnly(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

