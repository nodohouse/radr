import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

export type PrepDb =
  | ReturnType<typeof drizzlePostgres<typeof schema>>
  | ReturnType<typeof drizzlePglite<typeof schema>>;

declare global {
  var __prepDb: PrepDb | undefined;
  var __prepPglite: PGlite | undefined;
  var __prepSql: ReturnType<typeof postgres> | undefined;
}

function isPostgresUrl(url: string | undefined): url is string {
  return Boolean(url && /^postgres(ql)?:\/\//i.test(url));
}

function createDb(): PrepDb {
  const databaseUrl = process.env.DATABASE_URL;

  if (isPostgresUrl(databaseUrl)) {
    const sql =
      globalThis.__prepSql ??
      postgres(databaseUrl, {
        max: 10,
        prepare: false,
      });
    if (process.env.NODE_ENV !== "production") {
      globalThis.__prepSql = sql;
    }
    return drizzlePostgres(sql, { schema });
  }

  // During `next build`, avoid filesystem-backed PGlite (bundler path issues).
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (isBuild) {
    const client = new PGlite();
    return drizzlePglite(client, { schema });
  }

  const dataDir =
    process.env.PGLITE_DATA_DIR ??
    path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dataDir, { recursive: true });

  const client = globalThis.__prepPglite ?? new PGlite(dataDir);

  if (process.env.NODE_ENV !== "production") {
    globalThis.__prepPglite = client;
  }

  return drizzlePglite(client, { schema });
}

function getDb(): PrepDb {
  if (!globalThis.__prepDb) {
    globalThis.__prepDb = createDb();
  }
  return globalThis.__prepDb;
}

export const db = new Proxy({} as PrepDb, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };
