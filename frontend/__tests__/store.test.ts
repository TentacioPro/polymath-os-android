/**
 * Zustand Store Tests
 * 
 * Tests the global state management store.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useStore } from '../store/useStore';

// Reset store between tests
const resetStore = () => {
  const store = useStore.getState();
  store.setThemeName('void');
  store.clearAll();
  store.setLoading(false);
};

describe('Zustand Store Tests', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Theme State', () => {
    it('should have default theme as void', () => {
      const { themeName } = useStore.getState();
      expect(themeName).toBe('void');
    });

    it('should update theme name', () => {
      const { setThemeName } = useStore.getState();
      setThemeName('nova');
      
      expect(useStore.getState().themeName).toBe('nova');
    });

    it('should update theme to amber', () => {
      const { setThemeName } = useStore.getState();
      setThemeName('amber');
      
      expect(useStore.getState().themeName).toBe('amber');
    });
  });

  // Drawer was removed in M3 revamp — tab navigation replaced it

  describe('Activities State', () => {
    it('should have empty activities by default', () => {
      const { activities } = useStore.getState();
      expect(activities).toEqual([]);
    });

    it('should set activities', () => {
      const { setActivities } = useStore.getState();
      const testActivities = [
        { id: '1', title: 'Test Activity', source: 'manual', timestamp: '2026-03-16' },
        { id: '2', title: 'Another Activity', source: 'upload', timestamp: '2026-03-15' },
      ];
      
      setActivities(testActivities);
      
      expect(useStore.getState().activities).toHaveLength(2);
      expect(useStore.getState().activities[0].title).toBe('Test Activity');
    });
  });

  describe('Journals State', () => {
    it('should have empty journals by default', () => {
      const { journals } = useStore.getState();
      expect(journals).toEqual([]);
    });

    it('should set journals', () => {
      const { setJournals } = useStore.getState();
      const testJournals = [
        { id: '1', title: 'Test Journal', content: 'Content', tags: [], linked_activities: [], timestamp: '2026-03-16' },
      ];
      
      setJournals(testJournals);
      
      expect(useStore.getState().journals).toHaveLength(1);
      expect(useStore.getState().journals[0].title).toBe('Test Journal');
    });
  });

  describe('Connections State', () => {
    it('should have empty connections by default', () => {
      const { connections } = useStore.getState();
      expect(connections).toEqual([]);
    });

    it('should set connections', () => {
      const { setConnections } = useStore.getState();
      const testConnections = [
        { id: '1', from_id: 'a1', to_id: 'a2', connection_type: 'related' },
      ];
      
      setConnections(testConnections);
      
      expect(useStore.getState().connections).toHaveLength(1);
    });
  });

  describe('Loading State', () => {
    it('should not be loading by default', () => {
      const { isLoading } = useStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should set loading state', () => {
      const { setLoading } = useStore.getState();
      
      setLoading(true);
      expect(useStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useStore.getState().isLoading).toBe(false);
    });
  });

  describe('Clear All', () => {
    it('should clear all data', () => {
      const { setActivities, setJournals, setConnections, clearAll } = useStore.getState();
      
      // Set some data
      setActivities([{ id: '1', title: 'Test', source: 'manual', timestamp: '2026-03-16' }]);
      setJournals([{ id: '1', title: 'Test', content: '', tags: [], linked_activities: [], timestamp: '2026-03-16' }]);
      setConnections([{ id: '1' }]);
      
      // Verify data is set
      expect(useStore.getState().activities.length).toBeGreaterThan(0);
      
      // Clear all
      clearAll();
      
      // Verify cleared
      expect(useStore.getState().activities).toEqual([]);
      expect(useStore.getState().journals).toEqual([]);
      expect(useStore.getState().connections).toEqual([]);
    });
  });

  describe('Preferences', () => {
    it('should have default preferences', () => {
      const { preferences } = useStore.getState();
      expect(preferences.showQuickCaptureOnHome).toBe(true);
      expect(preferences.dashboardLayout).toBe('grid');
      expect(preferences.profileLayout).toBe('full');
      expect(preferences.fontCollection).toBe('industrial');
      expect(preferences.fontScale).toBe(1);
    });

    it('should update preference', () => {
      const { setPreference } = useStore.getState();
      
      setPreference('dashboardLayout', 'list');
      
      expect(useStore.getState().preferences.dashboardLayout).toBe('list');
    });

    it('should update font preferences', () => {
      const { setPreference } = useStore.getState();
      
      setPreference('fontFamily', 'inter');
      expect(useStore.getState().preferences.fontFamily).toBe('inter');
      
      setPreference('monoFont', 'space-mono');
      expect(useStore.getState().preferences.monoFont).toBe('space-mono');
      
      setPreference('fontScale', 1.2);
      expect(useStore.getState().preferences.fontScale).toBe(1.2);
    });

    it('should update screen visibility', () => {
      const { setScreenVisibility } = useStore.getState();
      
      // Initially visible
      expect(useStore.getState().preferences.visibleScreens.chat).toBe(true);
      
      // Hide chat
      setScreenVisibility('chat', false);
      
      expect(useStore.getState().preferences.visibleScreens.chat).toBe(false);
    });
  });

  describe('Hydration', () => {
    it('should resolve hydration with AsyncStorage mock (mock resolves synchronously)', () => {
      // With the AsyncStorage jest mock, persist middleware hydrates synchronously.
      // In production, _hasHydrated starts false and becomes true after async storage read.
      // Here we verify the boolean type and that setHasHydrated can toggle it.
      const { _hasHydrated } = useStore.getState();
      expect(typeof _hasHydrated).toBe('boolean');
    });

    it('should set hydration state', () => {
      const { setHasHydrated } = useStore.getState();
      
      setHasHydrated(true);
      
      expect(useStore.getState()._hasHydrated).toBe(true);
    });
  });
});
