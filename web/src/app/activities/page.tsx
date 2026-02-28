'use client';

import { useState, useRef, useCallback } from 'react';
import {
  useActivities,
  useCreateActivity,
  useUploadActivities,
  useDeleteActivity,
} from '@/hooks/useActivities';
import { getCategoryColor } from '@/lib/constants';
import {
  Plus,
  Upload,
  X,
  ExternalLink,
  ChevronRight,
  Trash2,
} from 'lucide-react';

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
    await createActivity.mutateAsync({ title: title.trim(), url: url.trim() || undefined, notes: notes.trim() || undefined });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-poly-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-poly-text">Learning Activities</h1>
          <p className="text-sm text-poly-muted mt-1">
            {activities?.length || 0} activities tracked
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-poly-card border border-poly-border rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-poly-muted hover:text-poly-text transition-colors"
          >
            <Upload size={18} />
            Upload JSON
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-poly-indigo rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-white hover:bg-poly-indigo/90 transition-colors"
          >
            <Plus size={18} />
            Add Activity
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
        className={`border-2 border-dashed rounded-xl p-6 mb-6 text-center transition-colors ${
          dragOver
            ? 'border-poly-indigo bg-poly-indigo/10'
            : 'border-poly-border'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={24} className="mx-auto text-poly-dim mb-2" />
        <p className="text-sm text-poly-dim">
          Drag &amp; drop a JSON file here to import activities
        </p>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities?.map((activity) => (
          <div
            key={activity.id}
            className="bg-poly-card border border-poly-border rounded-xl p-4 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-poly-text flex-1 mr-3">
                {activity.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {activity.category && (
                  <span
                    className="text-[10px] font-bold text-white px-2 py-1 rounded-md"
                    style={{
                      backgroundColor: getCategoryColor(activity.category),
                    }}
                  >
                    {activity.category}
                  </span>
                )}
                <button
                  onClick={() => deleteActivity.mutate(activity.id)}
                  className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {activity.url && (
              <a
                href={activity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-poly-indigo hover:underline flex items-center gap-1 mb-2"
              >
                <ExternalLink size={14} />
                {activity.url.length > 60
                  ? activity.url.slice(0, 60) + '...'
                  : activity.url}
              </a>
            )}

            {activity.notes && (
              <p className="text-sm text-poly-muted mb-2 line-clamp-2">
                {activity.notes}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-poly-dim">
                {new Date(activity.timestamp).toLocaleDateString()} •{' '}
                {activity.source}
              </p>
              <ChevronRight size={16} className="text-poly-dim" />
            </div>
          </div>
        ))}
      </div>

      {activities?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-poly-muted">No activities yet</p>
          <p className="text-sm text-poly-dim mt-2">
            Add your first learning activity or upload a JSON file
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-poly-card rounded-t-3xl w-full max-w-lg p-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-poly-text">Add Activity</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={28} className="text-poly-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What did you learn?"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key takeaways..."
                  rows={3}
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || createActivity.isPending}
                className="w-full bg-poly-indigo rounded-xl py-4 text-base font-semibold text-white hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
              >
                {createActivity.isPending ? 'Adding...' : 'Add Activity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
