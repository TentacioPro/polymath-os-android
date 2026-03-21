'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { M3Chip } from './M3Chip';

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES = ['productivity tips', 'meditation', 'workout routines'];
const CATEGORIES = ['All', 'Activities', 'Journals', 'Connections', 'Resources'];

export function SearchOverlay({ visible, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Escape key and Cmd/Ctrl+K
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!visible) {
          // This would need parent to manage visibility
        } else {
          inputRef.current?.focus();
        }
      }
    },
    [onClose, visible]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-focus on open
  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSelectedCategory(null);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="search-overlay">
      {/* Search bar */}
      <div className="search-bar">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search activities, journals, connections..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
        />
        {query.length > 0 ? (
          <button
            className="clear-btn"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
            </svg>
          </button>
        ) : (
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <M3Chip
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            variant="filter"
          />
        ))}
      </div>

      {/* Recent searches */}
      {query.length < 2 && (
        <div className="recent-section">
          <h3 className="section-label">Recent Searches</h3>
          {RECENT_SEARCHES.map((search, i) => (
            <button
              key={i}
              className="recent-item"
              onClick={() => setQuery(search)}
            >
              <svg
                className="recent-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="recent-text">{search}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results placeholder */}
      {query.length >= 2 && (
        <div className="empty-state">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="empty-text">No results found</span>
        </div>
      )}

      <style jsx>{`
        .search-overlay {
          position: fixed;
          inset: 0;
          background-color: var(--m3-surface-container-highest);
          z-index: 50;
          padding: 24px 16px;
          animation: overlay-fade-in 200ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        @keyframes overlay-fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 56px;
          padding: 0 16px;
          background-color: var(--m3-surface-container-high);
          border-radius: 9999px;
        }
        .search-icon {
          flex-shrink: 0;
          color: var(--m3-on-surface-variant);
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--m3-on-surface);
        }
        .search-input::placeholder {
          color: var(--m3-on-surface-variant);
        }
        .clear-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          color: var(--m3-on-surface-variant);
        }
        .cancel-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--m3-primary);
        }
        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .recent-section {
          margin-top: 24px;
        }
        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--m3-on-surface-variant);
          margin: 0 0 8px 4px;
        }
        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 4px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .recent-item:hover {
          background-color: var(--m3-surface-container-high);
          border-radius: 8px;
        }
        .recent-icon {
          flex-shrink: 0;
          color: var(--m3-on-surface-variant);
        }
        .recent-text {
          font-size: 14px;
          color: var(--m3-on-surface);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 48px 0;
          color: var(--m3-on-surface-variant);
        }
        .empty-text {
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}

export default SearchOverlay;
