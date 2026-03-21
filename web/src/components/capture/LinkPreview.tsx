'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain?: string;
}

interface LinkPreviewProps {
  url: string;
  metadata?: LinkMetadata | null;
  loading?: boolean;
  error?: boolean;
  onEditTitle?: (title: string) => void;
  onRemove?: () => void;
}

export function LinkPreview({
  url,
  metadata,
  loading = false,
  error = false,
  onEditTitle,
  onRemove,
}: LinkPreviewProps) {
  if (loading) {
    return (
      <div className="link-preview">
        <div className="skeleton-image shimmer" />
        <div className="content">
          <div className="domain-row">
            <div className="skeleton-circle shimmer" />
            <div className="skeleton-bar shimmer" style={{ width: 100 }} />
          </div>
          <div className="skeleton-bar shimmer" style={{ width: '85%' }} />
          <div className="skeleton-bar shimmer" style={{ width: '65%', height: 14 }} />
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="link-preview">
        <div className="error-content">
          <div className="error-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <p className="error-text">Could not fetch preview</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="url-link">{url}</a>
        </div>
        {onRemove && (
          <button className="remove-btn" onClick={onRemove}>&times;</button>
        )}
        <style jsx>{styles}</style>
      </div>
    );
  }

  const domain = metadata.domain || new URL(url).hostname;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview clickable">
      {metadata.image && (
        <div className="thumbnail">
          <img src={metadata.image} alt={metadata.title || ''} />
        </div>
      )}
      <div className="content">
        <div className="domain-row">
          {metadata.favicon ? (
            <img src={metadata.favicon} className="favicon" alt="" />
          ) : (
            <div className="favicon-fallback">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
            </div>
          )}
          <span className="domain">{domain}</span>
          {onEditTitle && (
            <button className="edit-btn" onClick={(e) => { e.preventDefault(); onEditTitle(metadata.title || ''); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
        </div>
        <h4 className="title">{metadata.title || url}</h4>
        {metadata.description && (
          <p className="description">{metadata.description}</p>
        )}
      </div>
      {onRemove && (
        <button className="remove-btn" onClick={(e) => { e.preventDefault(); onRemove(); }}>&times;</button>
      )}
      <style jsx>{styles}</style>
    </a>
  );
}

const styles = `
  .link-preview {
    background: var(--m3-surface-container);
    border-radius: 28px;
    overflow: hidden;
    position: relative;
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .link-preview.clickable {
    cursor: pointer;
    transition: transform 150ms, box-shadow 150ms;
  }
  .link-preview.clickable:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .thumbnail { width: 100%; height: 160px; overflow: hidden; }
  .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
  .content { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
  .domain-row { display: flex; align-items: center; gap: 8px; }
  .favicon { width: 24px; height: 24px; border-radius: 50%; }
  .favicon-fallback {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--m3-primary-container);
    color: var(--m3-on-primary-container);
    display: flex; align-items: center; justify-content: center;
  }
  .domain { font-size: 12px; color: var(--m3-on-surface-variant); flex: 1; }
  .edit-btn {
    background: none; border: none; padding: 4px; cursor: pointer;
    color: var(--m3-on-surface-variant);
  }
  .title {
    font-size: 16px; font-weight: 600; color: var(--m3-on-surface);
    margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .description {
    font-size: 14px; color: var(--m3-on-surface-variant);
    margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .error-content { padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .error-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--m3-error-container, rgba(255,0,0,0.1));
    color: var(--m3-error);
    display: flex; align-items: center; justify-content: center;
  }
  .error-text { font-size: 14px; color: var(--m3-on-surface-variant); margin: 0; }
  .url-link { font-size: 12px; color: var(--m3-primary); }
  .remove-btn {
    position: absolute; top: 12px; right: 12px;
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--m3-surface-container-high);
    color: var(--m3-on-surface-variant);
    border: none; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .skeleton-image { width: 100%; height: 140px; background: var(--m3-surface-container-high); }
  .skeleton-circle { width: 24px; height: 24px; border-radius: 50%; background: var(--m3-surface-container-high); }
  .skeleton-bar { height: 18px; border-radius: 9px; background: var(--m3-surface-container-high); }
  .shimmer { animation: shimmer 1.6s ease-in-out infinite; }
  @keyframes shimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
`;
