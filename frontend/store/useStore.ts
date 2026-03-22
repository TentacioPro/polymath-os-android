import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preferences, defaultPreferences } from '../../shared/preferences';
import type { ThemeName } from '../../shared/design-tokens';

interface Activity {
  id: string;
  title: string;
  url?: string;
  source: string;
  category?: string;
  content_type?: string;
  notes?: string;
  timestamp: string;
  ai_analysis?: any;
}

interface Journal {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_activities: string[];
  timestamp: string;
}

interface AppState {
  // Theme
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;

  // Data
  activities: Activity[];
  journals: Journal[];
  connections: any[];
  isLoading: boolean;
  setActivities: (activities: Activity[]) => void;
  setJournals: (journals: Journal[]) => void;
  setConnections: (connections: any[]) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;

  // Preferences
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setScreenVisibility: (screen: keyof Preferences['visibleScreens'], visible: boolean) => void;

  // Theme hydration (manual async)
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      themeName: 'void' as ThemeName,
      setThemeName: (themeName) => set({ themeName }),

      // Data (not persisted — comes from API)
      activities: [],
      journals: [],
      connections: [],
      isLoading: false,
      setActivities: (activities) => set({ activities }),
      setJournals: (journals) => set({ journals }),
      setConnections: (connections) => set({ connections }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearAll: () => set({ activities: [], journals: [], connections: [] }),

      // Preferences
      preferences: defaultPreferences,
      setPreference: (key, value) => set((s) => ({
        preferences: { ...s.preferences, [key]: value },
      })),
      setScreenVisibility: (screen, visible) => set((s) => ({
        preferences: {
          ...s.preferences,
          visibleScreens: { ...s.preferences.visibleScreens, [screen]: visible },
        },
      })),

      // Hydration
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'polymath-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme + preferences, NOT api data
      partialize: (state) => ({
        themeName: state.themeName,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
