/**
 * Production security headers for Next.js `headers()`.
 * CSP is intentionally strict but allows Next.js + RADR assets.
 */

export function securityHeaders(): { key: string; value: string }[] {
  const isProd = process.env.NODE_ENV === "production";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    // Next.js requires inline scripts/styles in App Router; tighten further when nonces land.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "worker-src 'self' blob:",
    // Only force HTTPS upgrade in real production HTTPS deploys - breaks localhost HTTP.
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const headers: { key: string; value: string }[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Content-Security-Policy", value: csp },
  ];

  if (isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
