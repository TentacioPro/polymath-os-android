export const CATEGORY_COLORS: Record<string, string> = {
  AI: '#8b5cf6',
  News: '#3b82f6',
  Tools: '#10b981',
  Market: '#f59e0b',
  Research: '#ec4899',
  Tutorial: '#06b6d4',
  Other: '#6b7280',
};

export const MEMORY_TYPE_COLORS: Record<string, string> = {
  short_term: '#3b82f6',
  long_term: '#10b981',
  insight: '#f59e0b',
  pattern: '#ec4899',
  archived: '#6b7280',
};

export const getCategoryColor = (category: string): string =>
  CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

export const getMemoryTypeColor = (type: string): string =>
  MEMORY_TYPE_COLORS[type] || MEMORY_TYPE_COLORS.archived;
