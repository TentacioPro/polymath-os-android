/**
 * Analytics Utility Tests
 * 
 * Tests the product analytics tracking system.
 */

import {
  initAnalytics,
  trackEvent,
  trackScreenView,
  trackActivityCreated,
  trackJournalCreated,
  trackSearch,
  trackExport,
  trackChatMessage,
  trackThemeChanged,
  trackError,
  shutdownAnalytics,
} from '../utils/analytics';

// Mock __DEV__ for testing
declare const global: { __DEV__: boolean };
(global as any).__DEV__ = true;

describe('Analytics Utility Tests', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    // Re-initialize for each test
    shutdownAnalytics();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('initAnalytics', () => {
    it('should initialize analytics with default enabled state', () => {
      initAnalytics();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Initialized:',
        expect.objectContaining({ enabled: true })
      );
    });

    it('should initialize analytics with disabled state', () => {
      initAnalytics(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Initialized:',
        expect.objectContaining({ enabled: false })
      );
    });

    it('should generate a session ID', () => {
      initAnalytics();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Initialized:',
        expect.objectContaining({ 
          sessionId: expect.stringMatching(/^\d+-[a-z0-9]+$/)
        })
      );
    });
  });

  describe('trackEvent', () => {
    it('should not track events when analytics is disabled', () => {
      initAnalytics(false);
      consoleSpy.mockClear();
      
      trackEvent('activity_created', { source: 'manual' });
      
      // Should not log anything beyond initialization
      expect(consoleSpy).not.toHaveBeenCalledWith(
        '[Analytics] Event:',
        expect.anything(),
        expect.anything()
      );
    });

    it('should track events when analytics is enabled', () => {
      initAnalytics(true);
      consoleSpy.mockClear();
      
      trackEvent('activity_created', { source: 'manual' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'activity_created',
        expect.objectContaining({ source: 'manual' })
      );
    });

    it('should include timestamp in event properties', () => {
      initAnalytics(true);
      consoleSpy.mockClear();
      
      trackEvent('activity_created');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'activity_created',
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
        })
      );
    });
  });

  describe('Convenience tracking methods', () => {
    beforeEach(() => {
      initAnalytics(true);
      consoleSpy.mockClear();
    });

    it('trackScreenView should track screen_viewed event', () => {
      trackScreenView('Dashboard', 'Activities');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'screen_viewed',
        expect.objectContaining({
          screen_name: 'Dashboard',
          previous_screen: 'Activities',
        })
      );
    });

    it('trackActivityCreated should track activity_created event', () => {
      trackActivityCreated('manual', 'AI');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'activity_created',
        expect.objectContaining({
          source: 'manual',
          category: 'AI',
        })
      );
    });

    it('trackJournalCreated should track journal_created event', () => {
      trackJournalCreated(true, 3);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'journal_created',
        expect.objectContaining({
          has_tags: true,
          linked_activities_count: 3,
        })
      );
    });

    it('trackSearch should track search_executed event', () => {
      trackSearch(10, 5);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'search_executed',
        expect.objectContaining({
          query_length: 10,
          results_count: 5,
        })
      );
    });

    it('trackExport should track export_requested event', () => {
      trackExport('json', 100);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'export_requested',
        expect.objectContaining({
          format: 'json',
        })
      );
    });

    it('trackChatMessage should track chat_message_sent event', () => {
      trackChatMessage(50);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'chat_message_sent',
        expect.objectContaining({
          message_length: 50,
        })
      );
    });

    it('trackThemeChanged should track theme_changed event', () => {
      trackThemeChanged('void');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'theme_changed',
        expect.objectContaining({
          theme: 'void',
        })
      );
    });

    it('trackError should track error_occurred event', () => {
      trackError('NetworkError', 'Connection failed', 'Dashboard');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Event:',
        'error_occurred',
        expect.objectContaining({
          error_type: 'NetworkError',
          error_message: 'Connection failed',
          screen: 'Dashboard',
        })
      );
    });
  });

  describe('shutdownAnalytics', () => {
    it('should disable analytics after shutdown', () => {
      initAnalytics(true);
      shutdownAnalytics();
      consoleSpy.mockClear();
      
      trackEvent('activity_created');
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
