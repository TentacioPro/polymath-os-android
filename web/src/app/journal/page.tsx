'use client';

import { useState } from 'react';
import { useJournals, useCreateJournal, useDeleteJournal } from '@/hooks/useJournals';
import { Plus, X, Trash2 } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-poly-text">Journal</h1>
          <p className="text-sm text-poly-muted mt-1">
            {journals?.length || 0} entries
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-poly-indigo rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-white hover:bg-poly-indigo/90 transition-colors"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Journal Cards */}
      <div className="space-y-3">
        {journals?.map((journal) => (
          <div
            key={journal.id}
            className="bg-poly-card border border-poly-border rounded-xl p-4 group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-semibold text-poly-text">{journal.title}</h3>
              <button
                onClick={() => deleteJournal.mutate(journal.id)}
                className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <p className="text-sm text-poly-muted line-clamp-4 mb-3">{journal.content}</p>

            {journal.tags && journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {journal.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-poly-border text-poly-indigo text-xs px-2.5 py-1 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-poly-dim">
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
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-poly-muted">No journal entries yet</p>
          <p className="text-sm text-poly-dim mt-2">
            Start journaling your learning journey
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-poly-card rounded-t-3xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-poly-text">New Journal Entry</h2>
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
                  placeholder="Entry title"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts..."
                  rows={6}
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="AI, Learning, Notes"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim() || createJournal.isPending}
                className="w-full bg-poly-indigo rounded-xl py-4 text-base font-semibold text-white hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
              >
                {createJournal.isPending ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
