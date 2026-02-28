'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import {
  FileJson,
  FileText,
  FileSpreadsheet,
  Upload,
  Info,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';

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
      title: 'Export as JSON',
      description: 'Complete data backup with all metadata',
      icon: FileJson,
      color: 'text-poly-indigo',
    },
    {
      format: 'markdown' as const,
      title: 'Export as Markdown',
      description: 'Human-readable format for notes',
      icon: FileText,
      color: 'text-poly-green',
    },
    {
      format: 'csv' as const,
      title: 'Export as CSV',
      description: 'Spreadsheet-compatible format',
      icon: FileSpreadsheet,
      color: 'text-poly-amber',
    },
  ];

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-poly-text">Export & Import</h1>
        <p className="text-sm text-poly-muted mt-1">Manage your data</p>
      </div>

      {/* Export Section */}
      <div className="mb-8 pb-8 border-b border-poly-card">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-poly-text">Export Data</h2>
        </div>
        <p className="text-sm text-poly-muted mb-4">
          Download your knowledge base in various formats
        </p>

        <div className="space-y-3">
          {exportCards.map((card) => (
            <button
              key={card.format}
              onClick={() => handleExport(card.format)}
              disabled={loading}
              className="w-full bg-poly-card border border-poly-border rounded-xl p-4 flex items-center gap-4 hover:border-poly-indigo/50 transition-colors text-left disabled:opacity-50"
            >
              <card.icon size={28} className={card.color} />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-poly-text">
                  {card.title}
                </h3>
                <p className="text-xs text-poly-muted">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Restore Section */}
      <div className="mb-8 pb-8 border-b border-poly-card">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-bold text-poly-text">Restore Data</h2>
        </div>
        <p className="text-sm text-poly-muted mb-4">
          Import a previous JSON backup to restore your data
        </p>

        <button
          onClick={() => setShowImportModal(true)}
          className="w-full bg-poly-card border-2 border-poly-pink rounded-xl p-4 flex items-center gap-4 hover:bg-poly-pink/5 transition-colors text-left"
        >
          <Upload size={28} className="text-poly-pink" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-poly-text">
              Import from JSON
            </h3>
            <p className="text-xs text-poly-muted">
              Restore from a previously exported backup
            </p>
          </div>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-poly-card border border-poly-indigo rounded-xl p-4 flex gap-3">
        <Info size={20} className="text-poly-indigo shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-poly-indigo mb-1">
            Data Portability
          </h3>
          <p className="text-xs text-poly-muted leading-relaxed">
            Your data is yours. Export anytime in the format that works best for
            you. JSON exports contain all metadata and can be used to fully
            restore your knowledge base.
          </p>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-5">
          <div className="bg-poly-card rounded-3xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-poly-border">
              <h2 className="text-xl font-bold text-poly-text">Import Data</h2>
              <button onClick={() => setShowImportModal(false)}>
                <X size={28} className="text-poly-muted" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <AlertTriangle size={48} className="text-poly-amber mb-4" />
              <h3 className="text-lg font-bold text-poly-text mb-2">
                Warning
              </h3>
              <p className="text-sm text-poly-muted text-center leading-relaxed mb-6">
                Importing data will merge with your existing data. Make sure the
                file is a valid Polymath OS JSON export.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full bg-poly-pink rounded-xl py-4 flex items-center justify-center gap-2 text-white font-semibold hover:bg-poly-pink/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Upload size={20} />
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
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="text-center">
            <Loader2 size={32} className="text-poly-indigo animate-spin mx-auto" />
            <p className="text-poly-text mt-4">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
