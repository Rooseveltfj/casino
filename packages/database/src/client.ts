import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbInstance | undefined;
let _pg: postgres.Sql | undefined;

/** Lazy singleton — initialised on first call. */
export function getDb(): DbInstance {
  if (_db !== undefined) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Copy .env.example → .env.local and fill in the value.",
    );
  }

  _pg = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  _db = drizzle(_pg, {
    schema,
    logger: process.env.DB_DEBUG === "true",
  });

  return _db;
}

/** Close the connection pool — call in graceful shutdown handlers. */
export async function closeDb(): Promise<void> {
  if (_pg) {
    await _pg.end();
    _pg = undefined;
    _db = undefined;
  }
}

export type Db = ReturnType<typeof getDb>;
