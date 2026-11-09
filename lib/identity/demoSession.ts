import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const DEMO_ACCESS_COOKIE = "radr_demo_access";
export const DEMO_ACCESS_SECONDS = 8 * 60 * 60;

/** Guest access is only for the fictional DEMO build, never LIVE or SANDBOX. */
export function guestDemoAllowed(
  environment = process.env.NEXT_PUBLIC_RADR_ENV,
) {
  return (environment || "DEMO").toUpperCase() === "DEMO";
}

function signingKey() {
  const secret =
    process.env.DEMO_SESSION_SECRET || process.env.BETTER_AUTH_SECRET;
  const value =
    secret ||
    (process.env.NODE_ENV !== "production" ? "radr-local-demo-only" : "");
  return value
    ? createHmac("sha256", value).update("radr:fictional-demo:v1").digest()
    : null;
}

export function demoSessionReady() {
  return guestDemoAllowed() && Boolean(signingKey());
}

export function createDemoGrant(now = Date.now()) {
  const key = signingKey();
  if (!guestDemoAllowed() || !key) throw new Error("Demo access unavailable");
  // No name, email, company, workspace ID or identity privileges in this cookie.
  const data = Buffer.from(
    JSON.stringify({
      scope: "registration-preview:v2",
      expires: now + DEMO_ACCESS_SECONDS * 1000,
      nonce: randomUUID(),
    }),
  ).toString("base64url");
  return `${data}.${createHmac("sha256", key).update(data).digest("base64url")}`;
}

export function verifyDemoGrant(token: string | undefined, now = Date.now()) {
  const key = signingKey();
  if (!guestDemoAllowed() || !key || !token || token.length > 1024)
    return false;
  try {
    const [data, signature, ...rest] = token.split(".");
    if (!data || !signature || rest.length) return false;
    const actual = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", key).update(data).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return false;
    const body = JSON.parse(Buffer.from(data, "base64url").toString());
    return (
      body.scope === "registration-preview:v2" &&
      typeof body.nonce === "string" &&
      Number.isFinite(body.expires) &&
      body.expires > now &&
      body.expires <= now + DEMO_ACCESS_SECONDS * 1000
    );
  } catch {
    return false;
  }
}
