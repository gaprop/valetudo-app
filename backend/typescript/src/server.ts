import cors from "cors";
import express from "express";
import { connectWithRetry } from "./db/pool.js";
import { errorHandler } from "./middleware/errors.js";
import { routes } from "./routes.js";

const port = process.env.PORT || "8080";

async function main() {
  await connectWithRetry();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(routes);
  app.use(errorHandler);

  app.listen(Number(port), () => {
    console.log(`fitness express backend listening on :${port}`);
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
