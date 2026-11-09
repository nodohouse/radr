/** Hosted product routes require an account or a separately verified fictional-demo grant. */
export function productRequiresSession(runtime: {
  nodeEnv?: string;
  requireAuth?: string;
  radrEnv?: string;
}) {
  const environment = (runtime.radrEnv || "DEMO").toUpperCase();
  return (
    runtime.nodeEnv === "production" ||
    runtime.requireAuth === "true" ||
    environment === "LIVE" ||
    environment === "SANDBOX"
  );
}
