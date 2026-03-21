'use client';

import { useState, useRef, useCallback } from 'react';
import {
  useActivities,
  useCreateActivity,
  useUploadActivities,
  useDeleteActivity,
  useUpdateActivity,
} from '@/hooks/useActivities';
import ResponsiveModal from '@/components/ResponsiveModal';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Popover, PopoverItem } from '@/components/ui/Popover';

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

function getDomain(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

export default function ActivitiesPage() {
  const { data: activities, isLoading } = useActivities();
  const createActivity = useCreateActivity();
  const uploadActivities = useUploadActivities();
  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState('All');

  // Popover state — context menu for activity cards
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const activeMenuBtnRef = useRef<HTMLButtonElement | null>(null);

  // Inline rename state
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    try {
      await createActivity.mutateAsync({
        title: title.trim(),
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setUrl('');
      setNotes('');
      setShowModal(false);
      toast.success('Knowledge added');
    } catch {
      toast.error('Failed to add knowledge');
    }
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await uploadActivities.mutateAsync(formData);
        toast.success('File imported successfully');
      } catch {
        toast.error('Import failed. Check file format.');
      }
    },
    [uploadActivities, toast]
  );

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Activity',
      message: 'This activity will be permanently removed.',
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'delete',
    });
    if (!ok) return;
    try {
      await deleteActivity.mutateAsync(id);
      toast.success('Activity deleted');
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await updateActivity.mutateAsync({ id, data: { title: newTitle.trim() } });
      toast.success('Activity renamed');
    } catch {
      toast.error('Failed to rename activity');
    } finally {
      setRenameId(null);
    }
  };

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
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight">Knowledge</h1>
          <p className="text-[12px] text-m3-on-surface-variant mt-0.5">{activities?.length || 0} sources</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
          </button>
          <Link
            href="/search"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-m3-primary text-m3-on-primary hover:opacity-90 transition-standard"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
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

      {/* Filter Chips — M3 style */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[12px] font-semibold shrink-0 transition-standard rounded-full border ${
              filter === f
                ? 'bg-m3-primary text-m3-on-primary border-m3-primary'
                : 'bg-m3-surface-container text-m3-on-surface border-m3-outline-variant hover:bg-m3-surface-container-high'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Drag-and-Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-4 text-center transition-standard ${
          dragOver ? 'border-m3-primary bg-m3-primary-container' : 'border-m3-outline-variant'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="material-symbols-outlined text-[20px] text-m3-on-surface-variant mb-1 block">upload_file</span>
        <p className="text-[10px] text-m3-on-surface-variant uppercase tracking-wider">Drop JSON file to import</p>
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-2">
        {filtered?.map((activity) => (
          <div
            key={activity.id}
            className="relative flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant transition-standard hover:bg-m3-surface-container-high group"
          >
            {/* Icon */}
            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-m3-primary-container">
              <span className="material-symbols-outlined text-[20px] text-m3-on-primary-container">
                {getTypeIcon(activity)}
              </span>
            </div>

            {/* Title + inline rename */}
            <div className="flex-1 min-w-0">
              {renameId === activity.id ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleRename(activity.id, renameValue); }}
                  className="flex items-center gap-2"
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => setRenameId(null)}
                    className="flex-1 bg-m3-surface border border-m3-primary rounded-xl px-3 py-1.5 text-[14px] text-m3-on-surface focus:outline-none"
                  />
                  <button type="submit" className="text-m3-primary">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </form>
              ) : (
                <Link href={`/activity-detail?id=${activity.id}`} className="block">
                  <p className="text-[14px] font-semibold text-m3-on-surface truncate">{activity.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[11px] text-m3-on-surface-variant truncate">
                      {activity.source}{activity.category ? ` · ${activity.category}` : ''}
                    </p>
                    {getDomain(activity.url) && (
                      <span className="text-[9px] text-m3-primary shrink-0 hidden sm:inline-block">
                        · {getDomain(activity.url)}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 shrink-0">
              {activity.category && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container uppercase hidden md:inline-block">
                  {activity.category}
                </span>
              )}
              {/* Three-dot context menu button (Hick's Law: Popover for non-destructive actions) */}
              <button
                ref={(el) => {
                  if (popoverOpenId === activity.id) activeMenuBtnRef.current = el;
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  activeMenuBtnRef.current = e.currentTarget;
                  setPopoverOpenId(popoverOpenId === activity.id ? null : activity.id);
                }}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-m3-on-surface-variant hover:bg-m3-surface-container-highest transition-standard"
                aria-label="More options"
                aria-haspopup="menu"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>
              <Link
                href={`/activity-detail?id=${activity.id}`}
                className="text-m3-on-surface-variant"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Context Popover — Hick's Law: simple actions stay in Popover */}
      <Popover
        open={popoverOpenId !== null}
        onClose={() => setPopoverOpenId(null)}
        anchorRef={activeMenuBtnRef as React.RefObject<HTMLElement | null>}
      >
        <PopoverItem
          icon="edit"
          label="Rename"
          onClick={() => {
            const act = activities?.find((a) => a.id === popoverOpenId);
            if (act) {
              setRenameValue(act.title);
              setRenameId(popoverOpenId);
            }
            setPopoverOpenId(null);
          }}
        />
        <PopoverItem
          icon="delete"
          label="Delete"
          variant="danger"
          onClick={() => {
            const id = popoverOpenId!;
            setPopoverOpenId(null);
            handleDelete(id);
          }}
        />
      </Popover>

      {filtered?.length === 0 && (
        <EmptyState
          variant="empty-activities"
          onCTA={() => setShowModal(true)}
        />
      )}

      {/* Add Modal */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="Add Knowledge">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you learn?"
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key takeaways..."
              rows={3}
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createActivity.isPending}
            className="w-full bg-m3-primary text-m3-on-primary rounded-2xl py-3 text-[14px] font-bold hover:opacity-90 transition-standard disabled:opacity-50"
          >
            {createActivity.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
