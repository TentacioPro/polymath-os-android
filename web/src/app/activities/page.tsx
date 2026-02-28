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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
            Learning Activities
          </h1>
          <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
            {activities?.length || 0} entries tracked
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-poly-border bg-poly-surface px-3 py-2 flex items-center gap-2 text-poly-muted hover:text-poly-text hover:bg-poly-accent hover:text-poly-accent-text transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Upload
            </span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-poly-accent text-poly-accent-text px-3 py-2 flex items-center gap-2 transition-colors hover:opacity-80"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Add
            </span>
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

      {/* Drag-and-Drop Zone */}
      <div
        className={`border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? 'border-poly-accent bg-poly-accent/10'
            : 'border-poly-border-muted'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="material-symbols-outlined text-[24px] text-poly-dim mb-2 block">
          upload_file
        </span>
        <p className="text-[10px] font-mono text-poly-dim uppercase tracking-wider">
          Drop JSON file to import
        </p>
      </div>

      {/* Activity List — responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activities?.map((activity) => (
          <div
            key={activity.id}
            className="border border-poly-border bg-poly-surface p-4 group flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-display font-bold text-poly-text flex-1 mr-3 uppercase">
                {activity.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {activity.category && (
                  <span
                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase"
                    style={{
                      backgroundColor: getCategoryColor(activity.category),
                      color: '#FFFFFF',
                    }}
                  >
                    {activity.category}
                  </span>
                )}
                <button
                  onClick={() => deleteActivity.mutate(activity.id)}
                  className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                </button>
              </div>
            </div>

            {activity.url && (
              <a
                href={activity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-poly-accent hover:underline flex items-center gap-1 mb-2"
              >
                <span className="material-symbols-outlined text-[14px]">
                  open_in_new
                </span>
                {activity.url.length > 50
                  ? activity.url.slice(0, 50) + '...'
                  : activity.url}
              </a>
            )}

            {activity.notes && (
              <p className="text-xs text-poly-muted mb-2 line-clamp-2">
                {activity.notes}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2">
              <p className="text-[10px] font-mono text-poly-dim">
                {new Date(activity.timestamp).toLocaleDateString()} &middot;{' '}
                {activity.source}
              </p>
              <span className="material-symbols-outlined text-[14px] text-poly-dim">
                chevron_right
              </span>
            </div>
          </div>
        ))}
      </div>

      {activities?.length === 0 && (
        <div className="text-center py-16 border border-poly-border-muted">
          <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
            description
          </span>
          <p className="text-sm font-display font-bold text-poly-muted uppercase">
            No activities yet
          </p>
          <p className="text-[10px] font-mono text-poly-dim mt-2">
            Add your first learning activity or upload a JSON file
          </p>
        </div>
      )}

      {/* Add Modal */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="Add Activity">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn?"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key takeaways..."
              rows={3}
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent resize-none font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createActivity.isPending}
            className="w-full bg-poly-accent text-poly-accent-text py-3 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 architect-shadow-sm"
          >
            {createActivity.isPending ? 'Adding...' : 'Add Activity'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
