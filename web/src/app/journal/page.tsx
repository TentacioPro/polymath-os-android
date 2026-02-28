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
    <div className="pt-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
            Journal
          </h1>
          <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
            {journals?.length || 0} entries
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-poly-accent text-poly-accent-text px-3 py-2 flex items-center gap-2 transition-colors hover:opacity-80"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
            New Entry
          </span>
        </button>
      </div>

      {/* Journal Cards — responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {journals?.map((journal) => (
          <div
            key={journal.id}
            className="border border-poly-border bg-poly-surface p-4 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-display font-bold text-poly-text uppercase">
                {journal.title}
              </h3>
              <button
                onClick={() => deleteJournal.mutate(journal.id)}
                className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            <p className="text-xs text-poly-muted line-clamp-4 mb-3 leading-relaxed">
              {journal.content}
            </p>

            {journal.tags && journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {journal.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="border border-poly-border-muted text-poly-accent text-[9px] px-2 py-0.5 font-mono font-bold uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[10px] font-mono text-poly-dim mt-auto pt-2">
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
        <div className="text-center py-16 border border-poly-border-muted">
          <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
            menu_book
          </span>
          <p className="text-sm font-display font-bold text-poly-muted uppercase">
            No journal entries yet
          </p>
          <p className="text-[10px] font-mono text-poly-dim mt-2">
            Start journaling your learning journey
          </p>
        </div>
      )}

      {/* Create Modal */}
      <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title="New Journal Entry">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts..."
              rows={6}
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent resize-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Learning, Notes"
              className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createJournal.isPending}
            className="w-full bg-poly-accent text-poly-accent-text py-3 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 architect-shadow-sm"
          >
            {createJournal.isPending ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
