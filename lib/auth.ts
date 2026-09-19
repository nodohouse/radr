import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "[radr] BETTER_AUTH_SECRET is required in production. Generate with: openssl rand -hex 32",
  );
}

export const auth = betterAuth({
  appName: "RADR",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      // Never log reset URLs or tokens in production.
      if (!isProd) {
        console.info(`[radr:dev] Password reset for ${user.email}: ${url}`);
        return;
      }

      if (!process.env.EMAIL_PROVIDER_CONFIGURED) {
        console.error(
          "[radr] Password reset requested but EMAIL_PROVIDER_CONFIGURED is not set. Failing closed.",
        );
        throw new Error("Email provider not configured");
      }

      // Placeholder - wire Resend/Postmark/SES before enabling customer recovery in prod.
      console.error(
        "[radr] EMAIL_PROVIDER_CONFIGURED is set but no provider implementation is wired yet.",
      );
      throw new Error("Email provider not implemented");
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    },
  },
  user: {
    additionalFields: {},
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
