'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A responsive 12-column grid container for the Fibonacci layout.
 * Enforces strict 8pt rhythm via gap-4 (16px) or gap-6 (24px).
 * Uses @container/base queries for structural responsiveness.
 */
export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`@container/bento w-full`}>
      <div className={`grid grid-cols-1 @[680px]/bento:grid-cols-12 gap-4 @[680px]/bento:gap-6 ${className}`}>
        {children}
      </div>
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean; // enable framer-motion micro-physics
}

/**
 * A bento card with optional micro-physics (tilt).
 * Fibonacci spanning should be handled by className (e.g. col-span-8, col-span-4).
 */
export function BentoCard({ children, className = '', tilt = true }: BentoCardProps) {
  const cardContent = (
    <div className={`h-full bg-m3-surface-container border border-m3-outline-variant hover:border-m3-outline rounded-3xl overflow-hidden transition-standard shadow-sm ${className}`}>
      {children}
    </div>
  );

  if (!tilt) {
    return cardContent;
  }

  return (
    <motion.div
      whileHover={{ scale: 0.99, translateY: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`h-full ${className}`}
    >
      <div className="h-full bg-m3-surface-container border border-m3-outline-variant hover:border-m3-outline hover:bg-m3-surface-container-high rounded-3xl overflow-hidden transition-standard shadow-sm">
        {children}
      </div>
    </motion.div>
  );
}
