'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import ResponsiveModal from '@/components/ResponsiveModal';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBlob = (data: any, filename: string, mimeType: string) => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'json' | 'markdown' | 'csv') => {
    try {
      setLoading(true);
      let res;
      let filename: string;
      let mime: string;

      switch (format) {
        case 'json':
          res = await api.exportJson();
          filename = `polymath_export_${Date.now()}.json`;
          mime = 'application/json';
          break;
        case 'markdown':
          res = await api.exportMarkdown();
          filename = `polymath_export_${Date.now()}.md`;
          mime = 'text/markdown';
          break;
        case 'csv':
          res = await api.exportCsv();
          filename = `polymath_export_${Date.now()}.csv`;
          mime = 'text/csv';
          break;
      }

      downloadBlob(res.data, filename, mime);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      await api.importRestore(formData);
      setShowImportModal(false);
      alert('Data restored successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const exportCards = [
    {
      format: 'json' as const,
      title: 'JSON',
      description: 'Complete data backup with all metadata',
      icon: 'data_object',
    },
    {
      format: 'markdown' as const,
      title: 'Markdown',
      description: 'Human-readable format for notes',
      icon: 'description',
    },
    {
      format: 'csv' as const,
      title: 'CSV',
      description: 'Spreadsheet-compatible format',
      icon: 'table_chart',
    },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
          Export & Import
        </h1>
        <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
          Data // Portability
        </p>
      </div>

      {/* Export Section */}
      <div>
        <h2 className="text-[10px] font-mono font-bold text-poly-muted uppercase tracking-widest mb-3">
          Export Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {exportCards.map((card) => (
            <button
              key={card.format}
              onClick={() => handleExport(card.format)}
              disabled={loading}
              className="w-full border border-poly-border bg-poly-surface p-4 flex items-center gap-4 md:flex-col md:items-start md:gap-3 hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-left disabled:opacity-50 group"
            >
              <span className="material-symbols-outlined text-[24px] text-poly-accent group-hover:text-poly-accent-text">
                {card.icon}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-display font-bold text-poly-text group-hover:text-poly-accent-text uppercase">
                  {card.title}
                </h3>
                <p className="text-[10px] font-mono text-poly-muted group-hover:text-poly-accent-text/70 mt-0.5">
                  {card.description}
                </p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-poly-dim group-hover:text-poly-accent-text">
                download
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Restore + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-[10px] font-mono font-bold text-poly-muted uppercase tracking-widest mb-3">
            Restore Data
          </h2>

          <button
            onClick={() => setShowImportModal(true)}
            className="w-full h-full border-2 border-dashed border-poly-border bg-poly-surface p-6 flex flex-col items-center gap-3 hover:border-poly-accent transition-colors group"
          >
            <span className="material-symbols-outlined text-[32px] text-poly-accent">
              upload_file
            </span>
            <div className="text-center">
              <h3 className="text-sm font-display font-bold text-poly-text uppercase">
                Import from JSON
              </h3>
              <p className="text-[10px] font-mono text-poly-muted mt-1">
                Restore from a previously exported backup
              </p>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="border border-poly-accent bg-poly-surface p-4 flex gap-3 h-fit">
        <span className="material-symbols-outlined text-[20px] text-poly-accent shrink-0 mt-0.5">
          info
        </span>
        <div>
          <h3 className="text-[10px] font-mono font-bold text-poly-accent mb-1 uppercase tracking-widest">
            Data Portability
          </h3>
          <p className="text-[11px] text-poly-muted leading-relaxed font-mono">
            Your data is yours. Export anytime in the format that works best for
            you. JSON exports contain all metadata and can be used to fully
            restore your knowledge base.
          </p>
        </div>
      </div>
      </div>

      {/* Import Modal */}
      <ResponsiveModal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import Data">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[48px] text-poly-accent mb-4">
            warning
          </span>
          <h3 className="text-sm font-display font-bold text-poly-text mb-2 uppercase">
            Warning
          </h3>
          <p className="text-[11px] font-mono text-poly-muted text-center leading-relaxed mb-6">
            Importing data will merge with your existing data. Make sure the
            file is a valid Polymath OS JSON export.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-poly-accent text-poly-accent-text py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 architect-shadow-sm"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                upload_file
              </span>
            )}
            {loading ? 'Importing...' : 'Select JSON File'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </div>
      </ResponsiveModal>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[var(--poly-overlay)] flex items-center justify-center z-40">
          <div className="text-center">
            <span className="material-symbols-outlined text-[32px] text-poly-accent animate-spin">
              progress_activity
            </span>
            <p className="text-poly-text mt-4 font-mono text-sm uppercase">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
