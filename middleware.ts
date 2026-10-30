import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { routing, isNonLocalizedPath } from "./i18n/routing";
import { safeDemoNext } from "./lib/marketing/demoAccess";

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = [
  "/home",
  "/scan",
  "/sources",
  "/cases",
  "/money",
  "/controls",
  "/documents",
  "/onboarding",
  "/select-org",
  "/invite",
];

const authPages = ["/login", "/signup", "/forgot-password", "/reset-password"];

function stripLocale(pathname: string): { locale: string | null; path: string } {
  const parts = pathname.split("/").filter(Boolean);
  const maybe = parts[0];
  if (maybe && routing.locales.includes(maybe as (typeof routing.locales)[number])) {
    const rest = "/" + parts.slice(1).join("/");
    return { locale: maybe, path: rest === "/" ? "/" : rest };
  }
  return { locale: null, path: pathname };
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

/**
 * next-intl `as-needed` rewrites `/` → `/en` internally.
 * Some Next production servers leak that as `307 Location: /` (same path) +
 * `x-middleware-rewrite`, which browsers treat as ERR_TOO_MANY_REDIRECTS (-310).
 * Convert that self-redirect into a real same-origin rewrite.
 */
function repairLeakedLocaleRewrite(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const status = response.status;
  if (status !== 307 && status !== 308) return response;

  const rewrite = response.headers.get("x-middleware-rewrite");
  const location = response.headers.get("location");
  if (!rewrite || !location) return response;

  const loc = new URL(location, request.url);
  if (
    loc.pathname !== request.nextUrl.pathname ||
    loc.search !== request.nextUrl.search
  ) {
    return response;
  }

  const dest = new URL(rewrite, request.url);
  const url = request.nextUrl.clone();
  url.pathname = dest.pathname;
  url.search = dest.search;

  const repaired = NextResponse.rewrite(url);
  response.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "location" || k === "x-middleware-rewrite") return;
    repaired.headers.set(key, value);
  });
  for (const cookie of response.cookies.getAll()) {
    repaired.cookies.set(cookie);
  }
  return repaired;
}

/** Unauthenticated /app → signup (demo unlock). Other protected → login. */
function redirectToAuth(request: NextRequest, nextPath: string, preferSignup: boolean) {
  const preferred =
    request.cookies.get("radr_locale")?.value || routing.defaultLocale;
  const locale =
    (routing.locales as readonly string[]).includes(preferred)
      ? preferred
      : routing.defaultLocale;
  const safeNext = safeDemoNext(nextPath, preferSignup ? "/app/enter" : "/onboarding");
  const authPath = preferSignup ? "signup" : "login";
  const url = new URL(`/${locale}/${authPath}`, request.url);
  if (preferSignup) {
    url.searchParams.set("intent", "demo");
  }
  url.searchParams.set("next", safeNext);
  return withSecurityHeaders(NextResponse.redirect(url));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Product demo, APIs, authenticated shell: no locale prefix
  if (isNonLocalizedPath(pathname)) {
    const sessionCookie = getSessionCookie(request);
    // Local / CI product QA only — never set RADR_E2E_UNLOCK on public prod.
    const e2eUnlock =
      process.env.RADR_E2E_UNLOCK === "1" &&
      (request.cookies.get("radr_e2e")?.value === "1" ||
        request.headers.get("x-radr-e2e") === "1");
    const isOnboardingPreview = pathname.startsWith("/onboarding/preview");
    const isAppPath = pathname === "/app" || pathname.startsWith("/app/");
    const isProtectedPrefix =
      protectedPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      ) && !isOnboardingPreview;
    // DEMO Northstar is public (AUTH_SECURITY_MODEL). LIVE/SANDBOX or
    // NEXT_PUBLIC_RADR_REQUIRE_AUTH=true require a session for /app.
    const radrEnv = (process.env.NEXT_PUBLIC_RADR_ENV ?? "DEMO").toUpperCase();
    const requireAuth =
      process.env.NEXT_PUBLIC_RADR_REQUIRE_AUTH === "true" ||
      radrEnv === "LIVE" ||
      radrEnv === "SANDBOX";
    const isProtected =
      isProtectedPrefix || (isAppPath && requireAuth);

    if (isProtected && !sessionCookie && !e2eUnlock) {
      const full = `${pathname}${request.nextUrl.search}`;
      const nextTarget =
        isAppPath && (pathname === "/app" || pathname === "/app/")
          ? "/app/enter"
          : full;
      return redirectToAuth(request, nextTarget, isAppPath);
    }

    // Product surfaces: never index (demo or authenticated).
    if (isAppPath) {
      const res = withSecurityHeaders(NextResponse.next());
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }

    return withSecurityHeaders(NextResponse.next());
  }

  const { path } = stripLocale(pathname);
  const sessionCookie = getSessionCookie(request);
  const isAuthPage = authPages.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (isAuthPage && sessionCookie) {
    const next = safeDemoNext(
      request.nextUrl.searchParams.get("next"),
      "/app/enter",
    );
    return withSecurityHeaders(NextResponse.redirect(new URL(next, request.url)));
  }

  const response = repairLeakedLocaleRewrite(request, intlMiddleware(request));
  return withSecurityHeaders(response);
}

export const config = {
  runtime: "nodejs",
  matcher: [
    // Localized marketing + auth (all locales prefixed, including en)
    "/",
    "/(en|de|nl|fr|es)/:path*",
    "/((?!api|app|home|scan|sources|cases|money|controls|documents|onboarding|select-org|invite|dev|mockups|_next|_vercel|.*\\..*).*)",
    // Non-localized authenticated surfaces (auth gate only)
    "/app",
    "/app/:path*",
    "/home",
    "/home/:path*",
    "/scan",
    "/scan/:path*",
    "/sources",
    "/sources/:path*",
    "/cases",
    "/cases/:path*",
    "/money",
    "/money/:path*",
    "/controls",
    "/controls/:path*",
    "/documents",
    "/documents/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/select-org",
    "/select-org/:path*",
    "/invite",
    "/invite/:path*",
  ],
};
