import { pool, connectWithRetry } from "./pool";
import { schemaSQL } from "./schema";

async function main() {
  await connectWithRetry();
  await pool.query(schemaSQL);
  await pool.end();
  console.log("database schema is ready");
}

void main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
