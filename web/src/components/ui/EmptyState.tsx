'use client';

import React from 'react';

type EmptyVariant =
  | 'empty-activities'
  | 'empty-journals'
  | 'empty-connections'
  | 'empty-search'
  | 'empty-alerts'
  | 'empty-memories'
  | 'empty-export';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCTA?: () => void;
}

const DEFAULTS: Record<EmptyVariant, { icon: string; title: string; description: string; cta: string }> = {
  'empty-activities': {
    icon: 'layers',
    title: 'No activities yet',
    description: 'Start capturing your thoughts, links, and discoveries to build your knowledge base.',
    cta: 'Add Activity',
  },
  'empty-journals': {
    icon: 'menu_book',
    title: 'Your journal is empty',
    description: 'Begin writing journal entries to reflect on your experiences and ideas.',
    cta: 'New Entry',
  },
  'empty-connections': {
    icon: 'hub',
    title: 'No connections found',
    description: 'Connections will emerge as you add more activities to your knowledge base.',
    cta: 'Explore Knowledge',
  },
  'empty-search': {
    icon: 'search',
    title: 'No results found',
    description: 'Try adjusting your search terms or exploring different categories.',
    cta: 'Clear Search',
  },
  'empty-alerts': {
    icon: 'notifications',
    title: 'All caught up',
    description: "You don't have any notifications right now.",
    cta: '',
  },
  'empty-memories': {
    icon: 'auto_awesome',
    title: 'No memories yet',
    description: 'Your AI agent will create memories as it learns from your interactions.',
    cta: 'Talk to Agent',
  },
  'empty-export': {
    icon: 'file_download',
    title: 'Nothing to export yet',
    description: 'Add some activities or journal entries first, then export your knowledge base.',
    cta: 'Add Activities',
  },
};

export function EmptyState({
  variant = 'empty-activities',
  title,
  description,
  ctaLabel,
  onCTA,
}: EmptyStateProps) {
  const d = DEFAULTS[variant];

  return (
    <div className="flex flex-col items-center py-12 px-8 gap-4">
      {/* Floating illustration */}
      <div className="w-24 h-24 rounded-full bg-m3-primary-container flex items-center justify-center mb-2 animate-float">
        <span className="material-symbols-outlined text-[48px] text-m3-on-primary-container">
          {d.icon}
        </span>
      </div>

      {/* Decorative dots */}
      <div className="flex gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-m3-primary opacity-30 inline-block" />
        <span className="w-2 h-2 rounded-full bg-m3-primary-container opacity-50 inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-m3-primary opacity-20 inline-block" />
      </div>

      <h3 className="text-[22px] font-semibold text-m3-on-surface text-center">
        {title || d.title}
      </h3>
      <p className="text-[14px] text-m3-on-surface-variant text-center leading-relaxed max-w-80">
        {description || d.description}
      </p>

      {(ctaLabel || d.cta) && onCTA && (
        <button
          onClick={onCTA}
          className="mt-2 px-8 py-4 rounded-full bg-m3-primary text-m3-on-primary font-semibold text-[14px] hover:opacity-90 active:scale-[0.97] transition-standard"
        >
          {ctaLabel || d.cta}
        </button>
      )}
    </div>
  );
}
