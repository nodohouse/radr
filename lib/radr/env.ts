/**
 * RADR runtime environment. Never mix DEMO numbers into LIVE UX unlabeled.
 */

export type RadrEnvironment = "DEMO" | "SANDBOX" | "LIVE";

const VALID: RadrEnvironment[] = ["DEMO", "SANDBOX", "LIVE"];

/**
 * Resolve environment from public env. Default DEMO for local / ungated /app.
 * LIVE must never be implied without explicit config.
 */
export function getRadrEnvironment(): RadrEnvironment {
  const raw = (process.env.NEXT_PUBLIC_RADR_ENV ?? "DEMO").toUpperCase();
  if (VALID.includes(raw as RadrEnvironment)) {
    return raw as RadrEnvironment;
  }
  return "DEMO";
}

export function environmentLabel(env: RadrEnvironment = getRadrEnvironment()): string {
  if (env === "LIVE") return "LIVE";
  if (env === "SANDBOX") return "SANDBOX · COMING SOON";
  return "DEMO";
}

export function environmentChrome(env: RadrEnvironment = getRadrEnvironment()): string {
  if (env === "LIVE") return "RADR / LIVE";
  if (env === "SANDBOX") return "RADR / SANDBOX";
  return "RADR / DEMO";
}

export function isSyntheticData(env: RadrEnvironment = getRadrEnvironment()): boolean {
  return env !== "LIVE";
}

/** Sandbox API/runtime is not shipped yet. */
export function sandboxAvailable(): boolean {
  return process.env.NEXT_PUBLIC_RADR_SANDBOX_LIVE === "true";
}
