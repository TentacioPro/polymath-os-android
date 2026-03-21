'use client';

import { useEffect, useState } from 'react';
import { api, type UrlMetadata } from '@/lib/api';

interface LinkPreviewProps {
  url: string;
  /** Compact mode for inline usage in lists */
  compact?: boolean;
}

export default function LinkPreview({ url, compact = false }: LinkPreviewProps) {
  const [meta, setMeta] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.extractMetadata(url);
        if (!cancelled) setMeta(res.data);
      } catch {
        // silently ignore — we just won't show a preview
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return compact ? (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-4 h-4 rounded bg-m3-surface-container-high shrink-0" />
        <div className="h-3 w-24 rounded bg-m3-surface-container-high" />
      </div>
    ) : (
      <div className="rounded-2xl border border-m3-outline-variant overflow-hidden animate-pulse">
        <div className="h-36 bg-m3-surface-container-high" />
        <div className="p-3 space-y-2">
          <div className="h-3 w-3/4 rounded bg-m3-surface-container-high" />
          <div className="h-2.5 w-full rounded bg-m3-surface-container-high" />
          <div className="h-2.5 w-1/2 rounded bg-m3-surface-container-high" />
        </div>
      </div>
    );
  }

  if (!meta) return null;

  /* ─── Compact (inline domain badge) ─── */
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        {meta.favicon && (
          <img
            src={meta.favicon}
            alt=""
            className="w-4 h-4 rounded shrink-0"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <span className="text-[10px] text-m3-on-surface-variant truncate">
          {meta.domain}
        </span>
      </div>
    );
  }

  /* ─── Full card preview ─── */
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-m3-outline-variant overflow-hidden bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard group"
    >
      {/* Thumbnail */}
      {meta.image && !imgError && (
        <div className="relative h-36 bg-m3-surface-container-high overflow-hidden">
          <img
            src={meta.image}
            alt={meta.title || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-standard"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-1">
        {/* Domain + Favicon */}
        <div className="flex items-center gap-1.5">
          {meta.favicon && (
            <img
              src={meta.favicon}
              alt=""
              className="w-4 h-4 rounded shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <span className="text-[10px] text-m3-on-surface-variant truncate">
            {meta.domain}
          </span>
        </div>

        {/* Title */}
        {meta.title && (
          <h4 className="text-[13px] font-semibold text-m3-on-surface line-clamp-2 leading-snug">
            {meta.title}
          </h4>
        )}

        {/* Description */}
        {meta.description && (
          <p className="text-[11px] text-m3-on-surface-variant line-clamp-2 leading-relaxed">
            {meta.description}
          </p>
        )}
      </div>
    </a>
  );
}
