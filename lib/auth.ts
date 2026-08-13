import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

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
      // Production: wire to a transactional email provider.
      // Never log reset URLs or tokens in production.
      if (process.env.NODE_ENV !== "production") {
        console.info(`[prep:dev] Password reset for ${user.email}: ${url}`);
        return;
      }

      if (!process.env.EMAIL_PROVIDER_CONFIGURED) {
        console.error(
          "[prep] Password reset requested but EMAIL_PROVIDER_CONFIGURED is not set.",
        );
        return;
      }

      // Placeholder for provider integration (Resend, Postmark, SES, etc.)
      console.error(
        "[prep] EMAIL_PROVIDER_CONFIGURED is set but no provider implementation is wired yet.",
      );
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
  user: {
    additionalFields: {},
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
