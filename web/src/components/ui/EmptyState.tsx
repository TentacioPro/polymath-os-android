'use client';

import React from 'react';

type EmptyVariant = 'empty-activities' | 'empty-journals' | 'empty-connections' | 'empty-search' | 'empty-alerts' | 'empty-memories';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCTA?: () => void;
}

const DEFAULTS: Record<EmptyVariant, { icon: string; title: string; description: string; cta: string }> = {
  'empty-activities': { icon: '📚', title: 'No activities yet', description: 'Start capturing your thoughts, links, and discoveries.', cta: 'Add Activity' },
  'empty-journals': { icon: '📝', title: 'Your journal is empty', description: 'Begin writing journal entries to reflect on your ideas.', cta: 'New Entry' },
  'empty-connections': { icon: '🔗', title: 'No connections found', description: 'Connections will emerge as you add more activities.', cta: 'Explore Knowledge' },
  'empty-search': { icon: '🔍', title: 'No results found', description: 'Try adjusting your search terms or exploring different categories.', cta: 'Clear Search' },
  'empty-alerts': { icon: '🔔', title: 'All caught up', description: "You don't have any notifications right now.", cta: '' },
  'empty-memories': { icon: '✨', title: 'No memories yet', description: 'Your AI agent will create memories as it learns.', cta: 'Talk to Agent' },
};

export function EmptyState({ variant = 'empty-activities', title, description, ctaLabel, onCTA }: EmptyStateProps) {
  const d = DEFAULTS[variant];

  return (
    <div className="empty-state">
      <div className="illustration">
        <span className="icon">{d.icon}</span>
      </div>
      <div className="dots">
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
      </div>
      <h3 className="title">{title || d.title}</h3>
      <p className="description">{description || d.description}</p>
      {(ctaLabel || d.cta) && onCTA && (
        <button className="cta-btn" onClick={onCTA}>{ctaLabel || d.cta}</button>
      )}

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 32px;
          gap: 16px;
        }
        .illustration {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--m3-primary-container);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .icon { font-size: 40px; }
        .dots {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--m3-primary);
        }
        .dot-1 { opacity: 0.3; }
        .dot-2 { opacity: 0.5; width: 8px; height: 8px; border-radius: 50%; background: var(--m3-primary-container); }
        .dot-3 { opacity: 0.2; }
        .title {
          font-size: 22px;
          font-weight: 600;
          color: var(--m3-on-surface);
          margin: 0;
          text-align: center;
        }
        .description {
          font-size: 14px;
          color: var(--m3-on-surface-variant);
          margin: 0;
          text-align: center;
          line-height: 1.6;
          max-width: 320px;
        }
        .cta-btn {
          margin-top: 8px;
          padding: 16px 32px;
          border-radius: 9999px;
          background: var(--m3-primary);
          color: var(--m3-on-primary);
          border: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 150ms;
        }
        .cta-btn:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
