import type { PoolClient, QueryResult, QueryResultRow } from "pg";
import { pool } from "../db/pool";
import { HttpError } from "../middleware/errors";

type Queryable = {
  query<TResult extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<TResult>>;
};

export function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function loadChildrenForParents<TParent, TChild>(
  parents: TParent[],
  loadChildren: (parent: TParent) => Promise<TChild[]>,
  assignChildren: (parent: TParent, children: TChild[]) => void
) {
  for (const parent of parents) {
    assignChildren(parent, await loadChildren(parent));
  }
}

export function firstRowOrNotFound<TRow>(
  rows: TRow[],
  notFoundMessage: string
) {
  const row = rows[0];
  if (!row) {
    throw new HttpError(404, notFoundMessage);
  }

  return row;
}

export function assertRowsAffected(
  result: Pick<QueryResult, "rowCount">,
  notFoundMessage: string
) {
  if (result.rowCount === 0) {
    throw new HttpError(404, notFoundMessage);
  }
}

export async function assertExists(
  queryable: Queryable,
  query: string,
  values: unknown[],
  notFoundMessage: string
) {
  const result = await queryable.query<{ exists: boolean }>(query, values);
  if (!result.rows[0]?.exists) {
    throw new HttpError(404, notFoundMessage);
  }
}

export async function assertNotExists(
  queryable: Queryable,
  query: string,
  values: unknown[],
  status: number,
  message: string
) {
  const result = await queryable.query<{ exists: boolean }>(query, values);
  if (result.rows[0]?.exists) {
    throw new HttpError(status, message);
  }
}

export async function withTransaction<TResult>(
  action: (client: PoolClient) => Promise<TResult>
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
