'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import LinkPreview from '@/components/LinkPreview';

function ActivityDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    api.getActivity(id)
      .then((r) => setActivity(r.data))
      .catch(() => setActivity(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center py-20">
        <span className="material-symbols-outlined text-[48px] text-m3-on-surface-variant">error_outline</span>
        <p className="text-[14px] text-m3-on-surface-variant mt-3">Activity not found</p>
        <Link href="/activities" className="text-[13px] text-m3-primary mt-2">Back to Knowledge</Link>
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3 px-1">
        <Link
          href="/activities"
          className="w-10 h-10 shrink-0 flex items-center justify-center mt-0.5 rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard"
        >
          <span className="material-symbols-outlined text-[20px] text-m3-on-surface">arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold text-m3-on-surface leading-tight">{activity.title}</h1>
          <p className="text-[12px] text-m3-on-surface-variant mt-1">
            {new Date(activity.timestamp).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Meta Card */}
      <div className="p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container flex flex-wrap gap-3">
        {activity.content_type && (
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-m3-primary text-m3-on-primary">
            {activity.content_type}
          </span>
        )}
        {activity.source && (
          <span className="text-[12px] text-m3-on-surface-variant">{activity.source}</span>
        )}
        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-m3-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            {activity.url.length > 40 ? activity.url.slice(0, 40) + '...' : activity.url}
          </a>
        )}
      </div>

      {/* Link Preview */}
      {activity.url && (
        <LinkPreview url={activity.url} />
      )}

      {/* Notes */}
      {activity.notes && (
        <div className="p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container">
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2">NOTES</p>
          <p className="text-[14px] text-m3-on-surface leading-relaxed whitespace-pre-wrap">{activity.notes}</p>
        </div>
      )}

      {/* AI Analysis */}
      {activity.ai_summary && (
        <div className="p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container">
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2">AI ANALYSIS</p>
          <p className="text-[13px] text-m3-on-surface leading-relaxed mb-3">{activity.ai_summary}</p>

          {/* Key Concepts */}
          {activity.key_concepts?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activity.key_concepts.map((concept: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-m3-outline-variant text-m3-on-surface"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}

          {/* Category */}
          {activity.category && (
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-m3-primary-container text-m3-on-primary-container">
              {activity.category}
            </span>
          )}
        </div>
      )}

      {/* Connections */}
      {activity.connections?.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">CONNECTIONS</p>
          <div className="flex flex-col gap-2">
            {activity.connections.map((conn: any, i: number) => (
              <div
                key={conn.id || i}
                className="flex items-center gap-3 p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container"
              >
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-m3-primary-container">
                  <span className="material-symbols-outlined text-[20px] text-m3-on-primary-container">hub</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-m3-on-surface">{conn.connection_type || 'Connection'}</p>
                  {conn.ai_reasoning && <p className="text-[11px] text-m3-on-surface-variant mt-0.5">{conn.ai_reasoning}</p>}
                </div>
                {conn.strength && (
                  <span className="text-[12px] font-bold text-m3-primary">{Math.round(conn.strength * 100)}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivityDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ActivityDetailContent />
    </Suspense>
  );
}
