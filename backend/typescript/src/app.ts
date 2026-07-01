import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "./middleware/errors";
import { routes } from "./routes";

export function createApp() {
  const app = express();
  app.use(cors({ credentials: true, origin: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(routes);
  app.use(errorHandler);
  return app;
}
