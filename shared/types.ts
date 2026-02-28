export interface Activity {
  id: string;
  title: string;
  url?: string;
  source: string;
  category?: string;
  content_type?: string;
  notes?: string;
  timestamp: string;
  hash?: string;
  ai_analysis?: {
    category: string;
    content_type: string;
    key_topics: string[];
    domain: string;
    learning_value: number;
  };
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_activities: string[];
  timestamp: string;
}

export interface Connection {
  id: string;
  from_id: string;
  to_id: string;
  connection_type: string;
  reasoning: string;
  strength: number;
  timestamp: string;
}

export interface AgentMemory {
  id: string;
  memory_type: 'short_term' | 'long_term' | 'insight' | 'pattern' | 'archived';
  content: string;
  source: string;
  importance: number;
  access_count: number;
  last_accessed?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  focus_areas: string[];
  behavior_traits: string[];
  custom_instructions: string;
  is_active: boolean;
  updated_at?: string;
}

export interface LearningLog {
  id: string;
  insight: string;
  learned_at: string;
  source_data?: {
    type?: string;
    [key: string]: any;
  };
}

export interface Stats {
  total_activities: number;
  total_journals: number;
  total_connections: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
}

export interface AgentStats {
  total_memories: number;
  long_term: number;
  events: number;
}

export interface AISuggestion {
  id: string;
  suggestion: string;
  reasoning: string;
  priority: string;
}
