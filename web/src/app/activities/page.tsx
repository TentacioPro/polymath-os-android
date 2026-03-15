'use client';

import { useState, useRef, useCallback } from 'react';
import {
  useActivities,
  useCreateActivity,
  useUploadActivities,
  useDeleteActivity,
} from '@/hooks/useActivities';
import { getCategoryColor } from '@/lib/constants';
import ResponsiveModal from '@/components/ResponsiveModal';
import Link from 'next/link';

const FILTERS = ['All', 'Article', 'PDF', 'Link', 'Audio', 'File'];

const TYPE_ICONS: Record<string, string> = {
  article: 'article',
  pdf: 'picture_as_pdf',
  link: 'link',
  audio: 'mic',
  video: 'videocam',
  file: 'folder',
  default: 'description',
};

function getTypeIcon(item: any): string {
  const type = (item.content_type || item.source || '').toLowerCase();
  for (const [key, icon] of Object.entries(TYPE_ICONS)) {
    if (type.includes(key)) return icon;
  }
  return TYPE_ICONS.default;
}

export default function ActivitiesPage() {
  const { data: activities, isLoading } = useActivities();
  const createActivity = useCreateActivity();
  const uploadActivities = useUploadActivities();
  const deleteActivity = useDeleteActivity();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await createActivity.mutateAsync({
      title: title.trim(),
      url: url.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setUrl('');
    setNotes('');
    setShowModal(false);
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      await uploadActivities.mutateAsync(formData);
    },
    [uploadActivities]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const filtered = filter === 'All'
    ? activities
    : activities?.filter((a) =>
        (a.content_type || a.source || '').toLowerCase().includes(filter.toLowerCase())
      );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Header — matching mobile Knowledge screen */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Knowledge</h1>
          <p className="text-[12px] text-poly-muted mt-0.5">{activities?.length || 0} sources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex items-center justify-center text-poly-text transition-colors hover:text-poly-accent"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
          </button>
          <Link
            href="/search"
            className="w-11 h-11 flex items-center justify-center text-poly-text"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="w-11 h-11 flex items-center justify-center bg-poly-accent"
            style={{ borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--poly-accent-text)' }}>add</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </div>
      </div>

      {/* Filter Chips — matching mobile horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 text-[12px] font-semibold shrink-0 transition-colors border"
            style={{
              backgroundColor: filter === f ? 'var(--poly-accent)' : 'var(--poly-surface)',
              color: filter === f ? 'var(--poly-accent-text)' : 'var(--poly-text)',
              borderColor: 'var(--poly-border-muted)',
              borderRadius: '10px',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Drag-and-Drop Zone (web only) */}
      <div
        className={`border-2 border-dashed p-4 text-center transition-colors ${
          dragOver ? 'border-poly-accent bg-poly-accent/10' : 'border-poly-border-muted'
        }`}
        style={{ borderRadius: '12px' }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="material-symbols-outlined text-[20px] text-poly-muted mb-1 block">upload_file</span>
        <p className="text-[10px] text-poly-muted uppercase tracking-wider">Drop JSON file to import</p>
      </div>

      {/* Activity List — matching mobile card style with icon */}
      <div className="flex flex-col gap-2">
        {filtered?.map((activity) => (
          <Link
            key={activity.id}
            href={`/activity-detail?id=${activity.id}`}
            className="flex items-center gap-3 p-3 border border-poly-border-muted transition-opacity hover:opacity-80 group"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
          >
            {/* Type icon — matching mobile itemIcon */}
            <div
              className="w-10 h-10 shrink-0 flex items-center justify-center"
              style={{ backgroundColor: 'var(--poly-bg)', borderRadius: '10px' }}
            >
              <span className="material-symbols-outlined text-[20px] text-poly-accent">
                {getTypeIcon(activity)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-poly-text truncate">{activity.title}</p>
              <p className="text-[11px] text-poly-muted truncate">
                {activity.source}{activity.category ? ` · ${activity.category}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {activity.category && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 uppercase hidden md:inline-block"
                  style={{
                    backgroundColor: getCategoryColor(activity.category),
                    color: '#FFFFFF',
                    borderRadius: '4px',
                  }}
                >
                  {activity.category}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteActivity.mutate(activity.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
              <span className="material-symbols-outlined text-[20px] text-poly-muted">chevron_right</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <span className="material-symbols-outlined text-[48px] text-poly-border-muted">folder_open</span>
          <p className="text-[14px] text-poly-muted mt-3">No sources found</p>
        </div>
      )}

      {/* Add Modal — matching mobile bottom sheet style */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="Add Knowledge">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn?"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key takeaways..."
              rows={3}
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent resize-none"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createActivity.isPending}
            className="w-full bg-poly-accent py-3 text-[14px] font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ color: 'var(--poly-accent-text)', borderRadius: '12px' }}
          >
            {createActivity.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
