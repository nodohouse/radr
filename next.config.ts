import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import { securityHeaders } from "@/lib/security/headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Avoid flaky webpack-runtime prerender races under parallel static generation.
  experimental: {
    cpus: 1,
    // Anonymous Vercel temp deploys reject Edge middleware.
    // Flag exists at runtime on Next 15.5; types lag behind.
    // @ts-expect-error nodeMiddleware not yet on ExperimentalConfig
    nodeMiddleware: true,
  },
  // Local PGlite / uploads must not be traced into serverless bundles.
  outputFileTracingExcludes: {
    "*": ["./.data/**/*", "./.tmp/**/*"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/agent-transcripts/**",
          "**/.cursor/**",
        ],
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
  async redirects() {
    return [
      // Fold methodology dual-story into Platform architecture
      { source: "/how", destination: "/product", permanent: true },
      { source: "/:locale(en|de|fr|nl|es)/how", destination: "/:locale/product", permanent: true },
      { source: "/how/:path*", destination: "/product", permanent: true },
      {
        source: "/:locale(en|de|fr|nl|es)/how/:path*",
        destination: "/:locale/product",
        permanent: true,
      },
      // Unify product: legacy (app) tree → /app
      { source: "/home", destination: "/app", permanent: false },
      { source: "/cases", destination: "/app/findings", permanent: false },
      { source: "/money", destination: "/app/value", permanent: false },
      { source: "/controls", destination: "/app/controls", permanent: false },
      { source: "/sources", destination: "/app/data", permanent: false },
      { source: "/documents", destination: "/app/data", permanent: false },
      { source: "/documents/:id", destination: "/app/data", permanent: false },
      { source: "/scan", destination: "/app/data", permanent: false },
      // Product aliases
      { source: "/app/performance", destination: "/app/forecast", permanent: false },
      { source: "/app/performance/:path*", destination: "/app/forecast", permanent: false },
      { source: "/app/team", destination: "/app/settings", permanent: false },
      { source: "/app/signals", destination: "/app/findings", permanent: false },
      { source: "/app/signals/:id", destination: "/app/findings/:id", permanent: false },
    ];
  },
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
