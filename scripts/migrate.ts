import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationsFolder = path.join(process.cwd(), "drizzle");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && /^postgres(ql)?:\/\//i.test(databaseUrl)) {
    const sql = postgres(databaseUrl, { max: 1 });
    const db = drizzlePostgres(sql);
    await migratePostgres(db, { migrationsFolder });
    await sql.end();
    console.log("Migrations applied (PostgreSQL).");
    return;
  }

  const dataDir =
    process.env.PGLITE_DATA_DIR ??
    path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite(client);
  await migratePglite(db, { migrationsFolder });
  await client.close();
  console.log(`Migrations applied (PGlite at ${dataDir}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
