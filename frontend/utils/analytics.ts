/**
 * Product Analytics Event Taxonomy
 * 
 * This module defines the event schema for product analytics tracking.
 * Events are designed to be privacy-safe and focused on feature usage.
 * 
 * Integration with analytics providers (Mixpanel, PostHog, Segment, etc.)
 * can be added by implementing the `sendEvent` function.
 */

// Event types based on 06_SECURITY_ANALYTICS_SENTRY_AUDIT.md taxonomy
export type EventName =
  | 'activity_created'
  | 'activity_uploaded'
  | 'activity_deleted'
  | 'activity_viewed'
  | 'journal_created'
  | 'journal_updated'
  | 'journal_deleted'
  | 'connection_generated'
  | 'chat_message_sent'
  | 'chat_response_received'
  | 'search_executed'
  | 'export_requested'
  | 'import_restored'
  | 'theme_changed'
  | 'screen_viewed'
  | 'quick_capture_opened'
  | 'quick_capture_submitted'
  | 'agent_learn_triggered'
  | 'agent_memory_consolidated'
  | 'suggestions_requested'
  | 'error_occurred';

interface BaseEventProperties {
  timestamp: string;
  session_id?: string;
  screen?: string;
}

interface ActivityEventProperties extends BaseEventProperties {
  activity_id?: string;
  source?: string;
  category?: string;
}

interface JournalEventProperties extends BaseEventProperties {
  journal_id?: string;
  has_tags?: boolean;
  linked_activities_count?: number;
}

interface SearchEventProperties extends BaseEventProperties {
  query_length?: number;
  results_count?: number;
}

interface ExportEventProperties extends BaseEventProperties {
  format?: 'json' | 'markdown' | 'csv';
  items_count?: number;
}

interface ChatEventProperties extends BaseEventProperties {
  message_length?: number;
  memories_used?: number;
}

interface ScreenViewProperties extends BaseEventProperties {
  screen_name: string;
  previous_screen?: string;
}

interface ErrorEventProperties extends BaseEventProperties {
  error_type: string;
  error_message?: string;
  screen?: string;
}

type EventProperties = 
  | ActivityEventProperties
  | JournalEventProperties
  | SearchEventProperties
  | ExportEventProperties
  | ChatEventProperties
  | ScreenViewProperties
  | ErrorEventProperties
  | BaseEventProperties;

// Analytics state
let isEnabled = false;
let sessionId: string | null = null;
const eventQueue: Array<{ name: EventName; properties: EventProperties }> = [];

// Generate session ID
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize analytics tracking
 * Call this at app startup
 */
export const initAnalytics = (enabled: boolean = true) => {
  isEnabled = enabled;
  sessionId = generateSessionId();
  
  if (__DEV__) {
    console.log('[Analytics] Initialized:', { enabled, sessionId });
  }
};

/**
 * Track an analytics event
 */
export const trackEvent = (name: EventName, properties?: Partial<EventProperties>) => {
  if (!isEnabled) return;

  const event = {
    name,
    properties: {
      timestamp: new Date().toISOString(),
      session_id: sessionId || undefined,
      ...properties,
    },
  };

  // In development, just log the event
  if (__DEV__) {
    console.log('[Analytics] Event:', event.name, event.properties);
    return;
  }

  // In production, queue the event for sending
  eventQueue.push(event);
  
  // Batch send events (implement actual sending when analytics provider is integrated)
  if (eventQueue.length >= 10) {
    flushEvents();
  }
};

/**
 * Flush queued events to analytics provider
 * Implement actual sending logic when provider is chosen
 */
const flushEvents = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0; // Clear queue

  // TODO: Implement actual sending to analytics provider
  // Example for PostHog:
  // await posthog.capture(events);
  
  // Example for Mixpanel:
  // await mixpanel.track(events);

  if (__DEV__) {
    console.log('[Analytics] Flushed', events.length, 'events');
  }
};

// Convenience methods for common events

export const trackScreenView = (screenName: string, previousScreen?: string) => {
  trackEvent('screen_viewed', {
    screen_name: screenName,
    previous_screen: previousScreen,
    screen: screenName,
  });
};

export const trackActivityCreated = (source: string, category?: string) => {
  trackEvent('activity_created', { source, category });
};

export const trackActivityUploaded = (source: string, itemsCount: number) => {
  trackEvent('activity_uploaded', { source, items_count: itemsCount } as any);
};

export const trackJournalCreated = (hasTags: boolean, linkedCount: number) => {
  trackEvent('journal_created', {
    has_tags: hasTags,
    linked_activities_count: linkedCount,
  });
};

export const trackConnectionGenerated = (activityId: string) => {
  trackEvent('connection_generated', { activity_id: activityId });
};

export const trackSearch = (queryLength: number, resultsCount: number) => {
  trackEvent('search_executed', {
    query_length: queryLength,
    results_count: resultsCount,
  });
};

export const trackExport = (format: 'json' | 'markdown' | 'csv', itemsCount: number) => {
  trackEvent('export_requested', { format, items_count: itemsCount } as any);
};

export const trackChatMessage = (messageLength: number) => {
  trackEvent('chat_message_sent', { message_length: messageLength });
};

export const trackThemeChanged = (theme: string) => {
  trackEvent('theme_changed', { theme } as any);
};

export const trackError = (errorType: string, errorMessage?: string, screen?: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    screen,
  });
};

// Cleanup on app close
export const shutdownAnalytics = () => {
  flushEvents();
  isEnabled = false;
  sessionId = null;
};
