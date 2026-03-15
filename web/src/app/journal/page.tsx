'use client';

import { useState } from 'react';
import { useJournals, useCreateJournal, useDeleteJournal } from '@/hooks/useJournals';
import ResponsiveModal from '@/components/ResponsiveModal';

export default function JournalPage() {
  const { data: journals, isLoading } = useJournals();
  const createJournal = useCreateJournal();
  const deleteJournal = useDeleteJournal();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await createJournal.mutateAsync({ title: title.trim(), content: content.trim(), tags });
    setTitle('');
    setContent('');
    setTagsInput('');
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Header — matching mobile */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-[20px] font-bold text-poly-text tracking-tight">
            Journal
          </h1>
          <p className="text-[12px] text-poly-muted mt-0.5">
            {journals?.length || 0} entries
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-11 h-11 flex items-center justify-center bg-poly-accent transition-opacity hover:opacity-80"
          style={{ borderRadius: '12px' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--poly-accent-text)' }}>add</span>
        </button>
      </div>

      {/* Journal Cards — matching mobile rounded style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {journals?.map((journal) => (
          <div
            key={journal.id}
            className="border border-poly-border-muted p-4 group flex flex-col"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[14px] font-semibold text-poly-text">
                {journal.title}
              </h3>
              <button
                onClick={() => deleteJournal.mutate(journal.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            <p className="text-[12px] text-poly-muted line-clamp-4 mb-3 leading-relaxed">
              {journal.content}
            </p>

            {journal.tags && journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {journal.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold uppercase px-2 py-0.5 text-poly-accent"
                    style={{ backgroundColor: 'var(--poly-accent)', opacity: 0.15, borderRadius: '6px' }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[11px] text-poly-muted mt-auto pt-2">
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
        <div className="flex flex-col items-center py-16">
          <span className="material-symbols-outlined text-[48px] text-poly-border-muted">menu_book</span>
          <p className="text-[14px] text-poly-muted mt-3">No journal entries yet</p>
          <p className="text-[12px] text-poly-muted mt-1">Start journaling your learning journey</p>
        </div>
      )}

      {/* Create Modal — matching mobile bottom sheet style */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="New Journal Entry">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              rows={6}
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent resize-none"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[1px] text-poly-muted mb-2 block font-semibold">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Learning, Notes"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-[15px] text-poly-text placeholder:text-poly-muted focus:outline-none focus:border-poly-accent"
              style={{ borderRadius: '12px' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createJournal.isPending}
            className="w-full bg-poly-accent py-3 text-[14px] font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ color: 'var(--poly-accent-text)', borderRadius: '12px' }}
          >
            {createJournal.isPending ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
