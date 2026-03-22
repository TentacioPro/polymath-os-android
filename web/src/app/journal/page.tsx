'use client';

import { useState } from 'react';
import { useJournals, useCreateJournal, useDeleteJournal } from '@/hooks/useJournals';
import ResponsiveModal from '@/components/ResponsiveModal';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';

export default function JournalPage() {
  const { data: journals, isLoading } = useJournals();
  const createJournal = useCreateJournal();
  const deleteJournal = useDeleteJournal();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const toast = useToast();
  const { confirm } = useConfirm();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await createJournal.mutateAsync({ title: title.trim(), content: content.trim(), tags });
      setTitle('');
      setContent('');
      setTagsInput('');
      setShowModal(false);
      toast.success('Journal entry saved');
    } catch {
      toast.error('Failed to save journal entry');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Entry',
      message: 'This journal entry will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'delete',
    });
    if (!ok) return;
    try {
      await deleteJournal.mutateAsync(id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="@container pt-4 flex flex-col gap-4 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">
            Journal
          </h1>
          <p className="text-[12px] text-m3-on-surface-variant mt-0.5">
            {journals?.length || 0} entries
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-m3-primary text-m3-on-primary hover:opacity-90 transition-standard"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {/* Journal Cards — auto-fit responsive grid (Kole Jain Phase 1) */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
        {journals?.map((journal) => (
          <div
            key={journal.id}
            className="rounded-2xl bg-m3-surface-container border border-m3-outline-variant p-4 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[14px] font-semibold text-m3-on-surface">
                {journal.title}
              </h3>
              <button
                onClick={() => handleDelete(journal.id)}
                className="opacity-0 group-hover:opacity-100 text-m3-error hover:text-m3-on-error-container transition-micro"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            <p className="text-[12px] text-m3-on-surface-variant line-clamp-4 mb-3 leading-relaxed prose-line-cap">
              {journal.content}
            </p>

            {journal.tags && journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {journal.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary-container"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[11px] text-m3-on-surface-variant mt-auto pt-2">
              {new Date(journal.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>

      {journals?.length === 0 && (
        <EmptyState
          variant="empty-journals"
          onCTA={() => setShowModal(true)}
        />
      )}

      {/* Create Modal */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="New Journal Entry">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              rows={6}
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-m3-on-surface-variant mb-2 block font-semibold">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Learning, Notes"
              className="w-full bg-m3-surface border border-m3-outline rounded-2xl px-4 py-3 text-[15px] text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createJournal.isPending}
            className="w-full bg-m3-primary text-m3-on-primary rounded-2xl py-3 text-[14px] font-bold hover:opacity-90 transition-standard disabled:opacity-50"
          >
            {createJournal.isPending ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
