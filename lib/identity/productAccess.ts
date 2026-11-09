/** Hosted interactive demos require signup; local fictional-data QA stays available. */
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
