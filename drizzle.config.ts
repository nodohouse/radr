import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      // Placeholder for drizzle-kit when using PGlite locally.
      // Migrations are applied via `npm run db:migrate` which supports PGlite.
      "postgresql://prep:prep@127.0.0.1:5432/prep",
  },
  strict: true,
  verbose: true,
});
