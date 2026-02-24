import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const useStore = create<AppState>((set) => ({
  activities: [],
  journals: [],
  connections: [],
  isLoading: false,
  setActivities: (activities) => set({ activities }),
  setJournals: (journals) => set({ journals }),
  setConnections: (connections) => set({ connections }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAll: () => set({ activities: [], journals: [], connections: [] }),
}));
