import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import {
  GenericContainer,
  Wait,
  type StartedTestContainer,
} from "testcontainers";

const { Client } = pg;

type IntegrationDatabase = {
  connectionString: string;
  stop: () => Promise<void>;
};

let container: StartedTestContainer | null = null;

export async function startIntegrationDatabase(): Promise<IntegrationDatabase> {
  container = await new GenericContainer("postgres:16-alpine")
    .withEnvironment({
      POSTGRES_DB: "fitness_test",
      POSTGRES_PASSWORD: "fitness",
      POSTGRES_USER: "fitness",
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const connectionString = `postgres://fitness:fitness@${container.getHost()}:${container.getMappedPort(
    5432
  )}/fitness_test?sslmode=disable`;
  await applySchema(connectionString);

  return {
    connectionString,
    stop: async () => {
      await container?.stop();
      container = null;
    },
  };
}

async function applySchema(connectionString: string) {
  const schemaPath = path.resolve(process.cwd(), "../../database/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  let lastError: unknown;

  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      await client.query(schema);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  throw lastError;
}
