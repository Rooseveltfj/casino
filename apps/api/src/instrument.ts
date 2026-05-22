/**
 * Sentry instrumentation — MUST be the very first import in main.ts.
 * Initialises Sentry before any NestJS/Fastify code is loaded so all
 * exceptions, slow requests, and console errors are captured correctly.
 */
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  serverName: "casino-api",

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  integrations: [
    // Capture unhandled promise rejections and uncaught exceptions
    Sentry.captureConsoleIntegration({ levels: ["error", "warn"] }),
  ],

  beforeSend(event) {
    // Strip sensitive fields from request data
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
    }
    return event;
  },
});
