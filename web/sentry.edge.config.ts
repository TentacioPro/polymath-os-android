import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for Edge runtime
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: `polymath-web@${process.env.npm_package_version || "0.1.0"}`,
    tracesSampleRate: 0.2,
    enabled: process.env.NODE_ENV === "production",
  });
}
