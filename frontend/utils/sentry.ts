import * as Sentry from '@sentry/react-native';

// Initialize Sentry only if DSN is configured
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE || 'polymath-mobile@1.0.0',
    
    // Performance monitoring
    tracesSampleRate: 0.2, // 20% of transactions
    
    // Don't send PII
    sendDefaultPii: false,
    
    // Enable automatic instrumentation
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    
    // Filter out development noise
    beforeSend(event, hint) {
      // Don't send events in development
      if (__DEV__) {
        console.log('[Sentry] Event captured (dev mode, not sent):', event.message || event.exception);
        return null;
      }
      return event;
    },
  });

  console.log('[Sentry] Initialized with environment:', process.env.EXPO_PUBLIC_ENVIRONMENT || 'development');
};

// Utility functions for error tracking
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (!SENTRY_DSN) return;
  
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (!SENTRY_DSN) return;
  
  Sentry.captureMessage(message, level);
};

export const setUserContext = (userId: string, userData?: Record<string, any>) => {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser({
    id: userId,
    ...userData,
  });
};

export const clearUserContext = () => {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser(null);
};

// Breadcrumb for navigation
export const addNavigationBreadcrumb = (from: string, to: string) => {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `${from} -> ${to}`,
    level: 'info',
  });
};

// Breadcrumb for user actions
export const addActionBreadcrumb = (action: string, data?: Record<string, any>) => {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: action,
    data,
    level: 'info',
  });
};

export { Sentry };
