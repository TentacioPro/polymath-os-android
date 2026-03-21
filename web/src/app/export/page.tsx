'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import ResponsiveModal from '@/components/ResponsiveModal';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

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
      toast.success(`Exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
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
      toast.success('Data restored successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const exportCards = [
    { format: 'json' as const, title: 'JSON', description: 'Complete data backup with all metadata', icon: 'data_object' },
    { format: 'markdown' as const, title: 'Markdown', description: 'Human-readable format for notes', icon: 'description' },
    { format: 'csv' as const, title: 'CSV', description: 'Spreadsheet-compatible format', icon: 'table_chart' },
  ];

  return (
    <div className="pt-4 flex flex-col gap-5">
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight">Export & Import</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">Data portability</p>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-3 px-1">Export Data</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {exportCards.map((card) => (
            <button
              key={card.format}
              onClick={() => handleExport(card.format)}
              disabled={loading}
              className="w-full rounded-2xl bg-m3-surface-container border border-m3-outline-variant p-4 flex flex-col items-center gap-3 transition-standard hover:bg-m3-surface-container-high text-center disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[28px] text-m3-primary">{card.icon}</span>
              <div>
                <h3 className="text-[14px] font-bold text-m3-on-surface">{card.title}</h3>
                <p className="text-[11px] text-m3-on-surface-variant mt-0.5">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-3 px-1">Restore Data</p>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full h-full border-2 border-dashed border-m3-outline-variant rounded-2xl bg-m3-surface-container p-6 flex flex-col items-center gap-3 hover:border-m3-primary transition-standard group"
          >
            <span className="material-symbols-outlined text-[32px] text-m3-primary">upload_file</span>
            <div className="text-center">
              <h3 className="text-[14px] font-bold text-m3-on-surface">Import from JSON</h3>
              <p className="text-[11px] text-m3-on-surface-variant mt-1">Restore from a previously exported backup</p>
            </div>
          </button>
        </div>

        <div className="rounded-2xl border border-m3-primary bg-m3-primary-container p-4 flex gap-3 h-fit">
          <span className="material-symbols-outlined text-[20px] text-m3-on-primary-container shrink-0 mt-0.5">info</span>
          <div>
            <h3 className="text-[11px] font-bold text-m3-on-primary-container mb-1 uppercase tracking-wider">Data Portability</h3>
            <p className="text-[12px] text-m3-on-primary-container/80 leading-relaxed">
              Your data is yours. Export anytime in the format that works best for you. JSON exports contain all metadata and can be used to fully restore your knowledge base.
            </p>
          </div>
        </div>
      </div>

      <ResponsiveModal open={showImportModal} onClose={() => setShowImportModal(false)} title="Import Data">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[48px] text-m3-warning mb-4">warning</span>
          <h3 className="text-[14px] font-bold text-m3-on-surface mb-2">Warning</h3>
          <p className="text-[12px] text-m3-on-surface-variant text-center leading-relaxed mb-6">
            Importing data will merge with your existing data. Make sure the file is a valid Polymath OS JSON export.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full bg-m3-primary text-m3-on-primary rounded-2xl py-3 flex items-center justify-center gap-2 text-[14px] font-bold hover:opacity-90 transition-standard disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
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

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-40" style={{ backgroundColor: 'var(--m3-surface-dim)' }}>
          <div className="text-center">
            <span className="material-symbols-outlined text-[32px] text-m3-primary animate-spin">progress_activity</span>
            <p className="text-m3-on-surface mt-4 text-sm uppercase tracking-wide">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
