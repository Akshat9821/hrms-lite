import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);

export function parseCorsOrigins(value: string): string[] | true {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "*") return true;
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

