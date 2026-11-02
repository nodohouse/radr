/** Local development can use PGlite. Hosted identities require persistent Postgres. */
export function accountStorageReady() {
  return !process.env.VERCEL || /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || "");
}
