import { create } from 'zustand';
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

// Personalization preferences
interface Preferences {
  // Quick Capture visibility
  showQuickCaptureOnHome: boolean;
  showQuickCaptureInSidebar: boolean;
  
  // Layout options
  sidebarPosition: 'left' | 'right' | 'hidden';
  dashboardLayout: 'grid' | 'list' | 'compact';
  profileLayout: 'full' | 'minimal';
  
  // Screen visibility
  visibleScreens: {
    dashboard: boolean;
    knowledge: boolean;
    mesh: boolean;
    journal: boolean;
    chat: boolean;
    analytics: boolean;
    integrations: boolean;
    alerts: boolean;
  };
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

  // Preferences
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  setScreenVisibility: (screen: keyof Preferences['visibleScreens'], visible: boolean) => void;

  // Theme hydration (manual async)
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

const defaultPreferences: Preferences = {
  showQuickCaptureOnHome: true,
  showQuickCaptureInSidebar: true,
  sidebarPosition: 'left',
  dashboardLayout: 'grid',
  profileLayout: 'full',
  visibleScreens: {
    dashboard: true,
    knowledge: true,
    mesh: true,
    journal: true,
    chat: true,
    analytics: true,
    integrations: true,
    alerts: true,
  },
};

export const useStore = create<AppState>()((set) => ({
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
}));
