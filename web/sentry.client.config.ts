import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for the client (browser)
// Set NEXT_PUBLIC_SENTRY_DSN in your .env.local to enable
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    release: `polymath-web@${process.env.npm_package_version || "0.1.0"}`,

    // Performance monitoring — keep low for free tier
    tracesSampleRate: 0.2,

    // Session replay — captures UI interactions on errors
    replaysSessionSampleRate: 0.0,   // Don't record normal sessions
    replaysOnErrorSampleRate: 0.5,   // Record 50% of sessions with errors

    // Only report errors in production
    enabled: process.env.NODE_ENV === "production",

    // Filter out noisy browser errors
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error promise rejection",
      "AbortError",
    ],
  });
}
