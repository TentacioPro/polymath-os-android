'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SEARCH_TYPES = ['All', 'Activities', 'Journals', 'Connections'];

interface SearchResult {
  type: 'activity' | 'journal' | 'connection';
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  timestamp?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search API call
  const { data: rawResults, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { activities: [], journals: [], connections: [] };
      const response = await api.search(debouncedQuery.trim());
      return response.data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 30000,
  });

  // Transform results into unified format
  const results: SearchResult[] = [];
  
  if (rawResults) {
    // Activities
    if (Array.isArray(rawResults.activities)) {
      rawResults.activities.forEach((a: any) => {
        results.push({
          type: 'activity',
          id: a.id || a._id,
          title: a.title,
          subtitle: a.source || a.category,
          category: a.category,
          timestamp: a.timestamp,
        });
      });
    }
    
    // Journals
    if (Array.isArray(rawResults.journals)) {
      rawResults.journals.forEach((j: any) => {
        results.push({
          type: 'journal',
          id: j.id || j._id,
          title: j.title,
          subtitle: j.tags?.join(', ') || 'Journal entry',
          timestamp: j.timestamp,
        });
      });
    }
    
    // Connections
    if (Array.isArray(rawResults.connections)) {
      rawResults.connections.forEach((c: any) => {
        results.push({
          type: 'connection',
          id: c.id || c._id,
          title: c.ai_reasoning || 'Connection',
          subtitle: c.connection_type,
          timestamp: c.timestamp,
        });
      });
    }
    
    // Handle flat array response
    if (Array.isArray(rawResults)) {
      rawResults.forEach((item: any) => {
        const type = item.type || (item.content ? 'journal' : item.connection_type ? 'connection' : 'activity');
        results.push({
          type,
          id: item.id || item._id,
          title: item.title || item.ai_reasoning || 'Result',
          subtitle: item.source || item.category || item.connection_type,
          category: item.category,
          timestamp: item.timestamp,
        });
      });
    }
  }

  // Filter results
  const filteredResults = activeFilter === 'All'
    ? results
    : results.filter((r) => {
        if (activeFilter === 'Activities') return r.type === 'activity';
        if (activeFilter === 'Journals') return r.type === 'journal';
        if (activeFilter === 'Connections') return r.type === 'connection';
        return true;
      });

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return 'article';
      case 'journal': return 'edit_note';
      case 'connection': return 'hub';
      default: return 'search';
    }
  };

  // Get result link
  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'activity': return `/activity-detail?id=${result.id}`;
      case 'journal': return '/journal';
      case 'connection': return '/connections';
      default: return '#';
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
    }
  }, []);

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight">Search</h1>
          <p className="text-[12px] text-m3-on-surface-variant mt-0.5">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative px-1">
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
          <span className="material-symbols-outlined text-[20px] text-m3-on-surface-variant">search</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search activities, journals, connections..."
          autoFocus
          className="w-full bg-m3-surface-container border border-m3-outline-variant rounded-2xl pl-12 pr-4 py-3.5 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        {SEARCH_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-4 py-2 text-[12px] font-semibold shrink-0 transition-standard rounded-full border ${
              activeFilter === type
                ? 'bg-m3-primary text-m3-on-primary border-m3-primary'
                : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant hover:bg-m3-surface-container-high'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {(isLoading || isFetching) && query && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
        </div>
      )}

      {/* Results List */}
      {!isLoading && !isFetching && filteredResults.length > 0 && (
        <div className="flex flex-col gap-2 px-1">
          {filteredResults.map((result, index) => (
            <Link
              key={`${result.type}-${result.id}-${index}`}
              href={getResultLink(result)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant transition-standard hover:bg-m3-surface-container-high"
            >
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-m3-primary-container">
                <span className="material-symbols-outlined text-[20px] text-m3-on-primary-container">
                  {getTypeIcon(result.type)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-m3-on-surface truncate">{result.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold uppercase text-m3-on-surface-variant tracking-wider">
                    {result.type}
                  </span>
                  {result.subtitle && (
                    <>
                      <span className="text-m3-outline-variant">·</span>
                      <span className="text-[11px] text-m3-on-surface-variant truncate">{result.subtitle}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Category Badge & Arrow */}
              <div className="flex items-center gap-2 shrink-0">
                {result.category && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container uppercase hidden md:inline-block">
                    {result.category}
                  </span>
                )}
                <span className="material-symbols-outlined text-[20px] text-m3-on-surface-variant">chevron_right</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State - No Query */}
      {!query && (
        <div className="flex flex-col items-center py-16 px-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-m3-surface-container mb-4">
            <span className="material-symbols-outlined text-[32px] text-m3-primary">search</span>
          </div>
          <p className="text-[14px] text-m3-on-surface-variant text-center">
            Search across your knowledge base
          </p>
          <p className="text-[12px] text-m3-on-surface-variant text-center mt-1 opacity-70">
            Find activities, journal entries, and connections
          </p>
        </div>
      )}

      {/* Empty State - No Results */}
      {query && !isLoading && !isFetching && filteredResults.length === 0 && (
        <div className="flex flex-col items-center py-16 px-4">
          <span className="material-symbols-outlined text-[48px] text-m3-outline-variant">search_off</span>
          <p className="text-[14px] text-m3-on-surface-variant mt-3">No results found for "{query}"</p>
          <p className="text-[12px] text-m3-on-surface-variant mt-1 opacity-70">
            Try different keywords or filters
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {!query && (
        <div className="px-1 mt-4">
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-3">
            Quick Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/activities"
              className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant hover:bg-m3-surface-container-high transition-standard"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">article</span>
              <span className="text-[13px] font-medium text-m3-on-surface">Activities</span>
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant hover:bg-m3-surface-container-high transition-standard"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">edit_note</span>
              <span className="text-[13px] font-medium text-m3-on-surface">Journals</span>
            </Link>
            <Link
              href="/connections"
              className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant hover:bg-m3-surface-container-high transition-standard"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">hub</span>
              <span className="text-[13px] font-medium text-m3-on-surface">Connections</span>
            </Link>
            <Link
              href="/agent"
              className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant hover:bg-m3-surface-container-high transition-standard"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">psychology</span>
              <span className="text-[13px] font-medium text-m3-on-surface">Agent</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
