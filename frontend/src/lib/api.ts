import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiErrorResponse = {
  error: { code: string; message: string; details?: unknown };
};

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | undefined;
    if (data?.error?.message) return data.error.message;
    return err.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

