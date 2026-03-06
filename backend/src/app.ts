import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { env, parseCorsOrigins } from "./env";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  const origin = parseCorsOrigins(env.CORS_ORIGIN);
  app.use(
    cors({
      origin,
      credentials: true,
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

