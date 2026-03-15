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
    <div className="pt-4 flex flex-col gap-5">
      {/* Header — matching mobile */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">
          Export & Import
        </h1>
        <p className="text-[12px] text-poly-muted mt-0.5">
          Data portability
        </p>
      </div>

      {/* Export Section */}
      <div>
        <h2 className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">
          Export Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {exportCards.map((card) => (
            <button
              key={card.format}
              onClick={() => handleExport(card.format)}
              disabled={loading}
              className="w-full border border-poly-border-muted p-4 flex flex-col items-center gap-3 transition-opacity hover:opacity-80 text-center disabled:opacity-50"
              style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
            >
              <span className="material-symbols-outlined text-[28px] text-poly-accent">
                {card.icon}
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-poly-text">
                  {card.title}
                </h3>
                <p className="text-[11px] text-poly-muted mt-0.5">
                  {card.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Restore + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">
            Restore Data
          </h2>

          <button
            onClick={() => setShowImportModal(true)}
            className="w-full h-full border-2 border-dashed border-poly-border-muted p-6 flex flex-col items-center gap-3 hover:border-poly-accent transition-colors group"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
          >
            <span className="material-symbols-outlined text-[32px] text-poly-accent">
              upload_file
            </span>
            <div className="text-center">
              <h3 className="text-[14px] font-bold text-poly-text">
                Import from JSON
              </h3>
              <p className="text-[11px] text-poly-muted mt-1">
                Restore from a previously exported backup
              </p>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="border border-poly-accent p-4 flex gap-3 h-fit" style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}>
        <span className="material-symbols-outlined text-[20px] text-poly-accent shrink-0 mt-0.5">
          info
        </span>
        <div>
          <h3 className="text-[11px] font-bold text-poly-accent mb-1 uppercase tracking-[1px]">
            Data Portability
          </h3>
          <p className="text-[12px] text-poly-muted leading-relaxed">
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
          <h3 className="text-[14px] font-bold text-poly-text mb-2">
            Warning
          </h3>
          <p className="text-[12px] text-poly-muted text-center leading-relaxed mb-6">
            Importing data will merge with your existing data. Make sure the
            file is a valid Polymath OS JSON export.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-poly-accent py-3 flex items-center justify-center gap-2 text-[14px] font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ color: 'var(--poly-accent-text)', borderRadius: '14px' }}
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
