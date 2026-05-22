import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@casino/ui"],
  experimental: {
    optimizePackageImports: ["@casino/ui", "motion"],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppress build output unless running in CI
  silent: !process.env.CI,

  // Upload wider sourcemaps for better stack traces
  widenClientFileUpload: true,

  // Annotate React components in stack traces
  reactComponentAnnotation: { enabled: true },

  // Hide source maps from the client bundle
  hideSourceMaps: true,

  // Remove Sentry SDK debug logging from the bundle
  disableLogger: true,

  // Automatically create Vercel Cron Monitors for scheduled routes
  automaticVercelMonitors: true,
});
