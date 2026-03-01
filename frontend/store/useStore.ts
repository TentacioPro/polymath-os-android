import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeName } from '../theme/tokens';

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

  // Drawer
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

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
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      themeName: 'void' as ThemeName,
      setThemeName: (themeName) => set({ themeName }),

      // Drawer
      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

      // Data
      activities: [],
      journals: [],
      connections: [],
      isLoading: false,
      setActivities: (activities) => set({ activities }),
      setJournals: (journals) => set({ journals }),
      setConnections: (connections) => set({ connections }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearAll: () => set({ activities: [], journals: [], connections: [] }),
    }),
    {
      name: 'polymath-os-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme preference, not transient state
      partialize: (state) => ({
        themeName: state.themeName,
      }),
    },
  ),
);
