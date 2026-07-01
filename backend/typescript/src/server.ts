import { createApp } from "./app";
import { connectWithRetry } from "./db/pool";

const port = process.env.PORT || "8080";

async function main() {
  await connectWithRetry();

  const app = createApp();

  app.listen(Number(port), () => {
    console.log(`fitness express backend listening on :${port}`);
  });
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
