'use client';

import React, { useState, useCallback, useRef } from 'react';

type UploadState = 'selected' | 'uploading' | 'processing' | 'success' | 'error';

interface FileUploadProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  onUpload: (onProgress: (pct: number) => void) => Promise<void>;
  onCancel?: () => void;
  onRetry?: () => void;
  errorMessage?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileColor(type: string) {
  if (type.includes('pdf')) return '#E57373';
  if (type.includes('json')) return '#64B5F6';
  if (type.includes('text')) return '#90A4AE';
  if (type.includes('image')) return '#81C784';
  return '#90A4AE';
}

export function FileUpload({
  fileName,
  fileSize,
  fileType,
  onUpload,
  onCancel,
  onRetry,
  errorMessage,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>('selected');
  const [progress, setProgress] = useState(0);
  const color = getFileColor(fileType);

  const handleUpload = useCallback(async () => {
    setState('uploading');
    setProgress(0);
    try {
      await onUpload((pct) => setProgress(pct));
      setState('processing');
      setTimeout(() => setState('success'), 800);
    } catch {
      setState('error');
    }
  }, [onUpload]);

  return (
    <div className="file-upload">
      <div className="header">
        <div className="icon-circle" style={{ background: color + '22' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={color}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke={color} strokeWidth="2"/></svg>
        </div>
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <span className="file-size">{formatSize(fileSize)}</span>
        </div>
      </div>

      {state === 'selected' && (
        <div className="actions">
          <span className="status-text">Ready to upload</span>
          <button className="upload-btn" onClick={handleUpload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
            Upload
          </button>
        </div>
      )}

      {state === 'uploading' && (
        <div className="progress-section">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-row">
            <span className="progress-text">{Math.round(progress)}%</span>
            {onCancel && (
              <button className="cancel-btn" onClick={onCancel}>&times;</button>
            )}
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="processing-row">
          <div className="spinner" />
          <span className="status-text">Analyzing...</span>
        </div>
      )}

      {state === 'success' && (
        <div className="success-row">
          <div className="check-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="success-text">Saved to knowledge base</span>
        </div>
      )}

      {state === 'error' && (
        <div className="error-section">
          <div className="error-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/></svg>
            <span className="error-text">{errorMessage || 'Upload failed'}</span>
          </div>
          {onRetry && (
            <button className="retry-btn" onClick={() => { setState('selected'); onRetry(); }}>Retry</button>
          )}
        </div>
      )}

      <style jsx>{`
        .file-upload {
          background: var(--m3-surface-container);
          border-radius: 28px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .header { display: flex; align-items: center; gap: 16px; }
        .icon-circle {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .file-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .file-name {
          font-size: 16px; font-weight: 600; color: var(--m3-on-surface);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .file-size { font-size: 12px; color: var(--m3-on-surface-variant); }
        .actions { display: flex; align-items: center; justify-content: space-between; }
        .status-text { font-size: 14px; color: var(--m3-on-surface-variant); }
        .upload-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 9999px;
          background: var(--m3-primary); color: var(--m3-on-primary);
          border: none; font-weight: 600; cursor: pointer;
        }
        .upload-btn:hover { opacity: 0.9; }
        .progress-section { display: flex; flex-direction: column; gap: 8px; }
        .progress-track {
          height: 4px; border-radius: 2px; overflow: hidden;
          background: var(--m3-surface-container-high);
        }
        .progress-fill {
          height: 100%; border-radius: 2px; background: var(--m3-primary);
          transition: width 200ms;
        }
        .progress-row { display: flex; align-items: center; justify-content: space-between; }
        .progress-text { font-size: 12px; color: var(--m3-on-surface-variant); }
        .cancel-btn {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--m3-surface-container-high);
          color: var(--m3-on-surface-variant); border: none; cursor: pointer;
        }
        .processing-row { display: flex; align-items: center; gap: 8px; }
        .spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 3px solid var(--m3-primary); border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .success-row { display: flex; align-items: center; gap: 8px; }
        .check-circle {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(129, 201, 149, 0.15); color: var(--m3-success);
          display: flex; align-items: center; justify-content: center;
          animation: scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        .success-text { font-size: 14px; color: var(--m3-success); }
        .error-section { display: flex; flex-direction: column; gap: 8px; }
        .error-row { display: flex; align-items: center; gap: 8px; color: var(--m3-error); }
        .error-text { font-size: 14px; color: var(--m3-error); }
        .retry-btn {
          align-self: flex-start;
          padding: 8px 20px; border-radius: 9999px;
          background: var(--m3-error-container, rgba(255,0,0,0.08));
          color: var(--m3-error); border: none; font-weight: 600; cursor: pointer;
        }
      `}</style>
    </div>
  );
}
