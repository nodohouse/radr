import { validEmail, validNewPassword } from "@/lib/onboarding/requiredFields";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { accountStorageReady } from "@/lib/identity/accountAvailability";

const handlers = toNextJsHandler(auth);
const unavailable = () =>
  Response.json(
    {
      code: "AUTH_NOT_CONFIGURED",
      message:
        "Account access is not enabled on this deployment yet. Explore the demo or setup preview.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
export async function GET(request: Request) {
  if (!accountStorageReady()) return unavailable();
  const response = await handlers.GET(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
export async function POST(request: Request) {
  if (!accountStorageReady()) return unavailable();
  const path = new URL(request.url).pathname;
  if (
    [
      "/sign-in/email",
      "/sign-up/email",
      "/request-password-reset",
      "/reset-password",
    ].some((endpoint) => path.endsWith(endpoint))
  ) {
    let data: Record<string, unknown>;
    try {
      const value: unknown = await request.clone().json();
      if (!value || typeof value !== "object" || Array.isArray(value))
        return Response.json({ message: "Invalid request" }, { status: 400 });
      data = value as Record<string, unknown>;
    } catch {
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }
    const password = data.password;
    const email = data.email;
    const invalid = path.endsWith("/reset-password")
      ? typeof data.newPassword !== "string" ||
        !validNewPassword(data.newPassword) ||
        typeof data.token !== "string" ||
        !data.token
      : typeof email !== "string" ||
        !validEmail(email) ||
        (path.endsWith("/sign-in/email") &&
          (typeof password !== "string" ||
            !password ||
            password.length > 128)) ||
        (path.endsWith("/sign-up/email") &&
          (typeof password !== "string" || !validNewPassword(password)));
    if (invalid)
      return Response.json(
        { message: "Complete the required fields with valid values." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
  }
  const response = await handlers.POST(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
