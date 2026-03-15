'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface HealthData {
  status: string;
  database: string;
  ai: string;
  version: string;
  timestamp: string;
  environment?: string;
  security?: {
    cors_mode: string;
    rate_limiting: boolean;
    auth_required: boolean;
  };
}

interface AIConfig {
  provider: string;
  model: string;
  api_key: string;
}

export default function IntegrationsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, configRes] = await Promise.all([
        api.getHealth().catch(() => ({ data: null })),
        api.getAiConfig().catch(() => ({ data: null })),
      ]);
      setHealth(healthRes.data);
      setConfig(configRes.data);
    } catch (e) {
      console.error('Failed to fetch integrations data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveConfig = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await api.setAiConfig({
        provider: 'openai',
        model: model.trim() || 'gpt-4o-mini',
        api_key: apiKey.trim(),
      });
      setShowConfigModal(false);
      setApiKey('');
      fetchData();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const dbStatus = health?.database === 'connected';
  const aiConfigured = config?.api_key && config.api_key.length > 5;

  const StatusCard = ({
    icon,
    label,
    desc,
    status,
    statusColor,
    onClick,
  }: {
    icon: string;
    label: string;
    desc: string;
    status: string;
    statusColor: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border border-poly-border-muted ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
    >
      <div
        className="w-11 h-11 flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'var(--poly-bg)', borderRadius: '12px' }}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: statusColor }}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-poly-text">{label}</p>
        <p className="text-[12px] text-poly-muted mt-0.5 truncate">{desc}</p>
      </div>
      <div
        className="px-2 py-1 shrink-0"
        style={{ backgroundColor: statusColor + '20', borderRadius: '6px' }}
      >
        <span className="text-[9px] font-bold tracking-wider" style={{ color: statusColor }}>
          {status}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin"
          style={{ borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Integrations</h1>
        <p className="text-[12px] text-poly-muted mt-0.5">System configuration</p>
      </div>

      {/* System Health */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">
          SYSTEM HEALTH
        </p>
        <div className="flex flex-col gap-2">
          <StatusCard
            icon="storage"
            label="Database"
            desc={`MongoDB — ${health?.database || 'unknown'}`}
            status={dbStatus ? 'ONLINE' : 'OFFLINE'}
            statusColor={dbStatus ? '#00FF94' : '#FF4444'}
          />
          <StatusCard
            icon="memory"
            label="Backend"
            desc={`v${health?.version || '0.1.0'} — ${health?.status || 'unknown'}`}
            status={health?.status === 'operational' ? 'RUNNING' : 'CHECK'}
            statusColor={health?.status === 'operational' ? '#00FF94' : '#FFB800'}
          />
        </div>
      </div>

      {/* Security Status */}
      {health?.security && (
        <div>
          <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">
            SECURITY
          </p>
          <div className="flex flex-col gap-2">
            <StatusCard
              icon="shield"
              label="CORS Policy"
              desc={`Mode: ${health.security.cors_mode}`}
              status={health.security.cors_mode === 'restricted' ? 'SECURE' : 'OPEN'}
              statusColor={health.security.cors_mode === 'restricted' ? '#00FF94' : '#FFB800'}
            />
            <StatusCard
              icon="speed"
              label="Rate Limiting"
              desc={health.security.rate_limiting ? 'Active' : 'Disabled'}
              status={health.security.rate_limiting ? 'ON' : 'OFF'}
              statusColor={health.security.rate_limiting ? '#00FF94' : '#FFB800'}
            />
            <StatusCard
              icon="key"
              label="API Authentication"
              desc={health.security.auth_required ? 'Required' : 'Not required'}
              status={health.security.auth_required ? 'REQUIRED' : 'OPEN'}
              statusColor={health.security.auth_required ? '#00FF94' : '#FFB800'}
            />
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">
          AI CONFIGURATION
        </p>
        <div className="flex flex-col gap-2">
          <StatusCard
            icon="psychology"
            label="OpenAI"
            desc={aiConfigured ? `Model: ${config?.model || 'gpt-4o-mini'}` : 'Not configured'}
            status={aiConfigured ? 'ACTIVE' : 'SETUP'}
            statusColor={aiConfigured ? '#00FF94' : '#FFB800'}
            onClick={() => setShowConfigModal(true)}
          />
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">
          INFO
        </p>
        <div
          className="p-4 border border-poly-border-muted"
          style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-poly-muted">Environment</span>
            <span className="text-[13px] font-semibold text-poly-text">
              {health?.environment || 'development'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-poly-muted">Backend URL</span>
            <span className="text-[13px] font-semibold text-poly-text truncate max-w-[200px]">
              {process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8001'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-poly-muted">Version</span>
            <span className="text-[13px] font-semibold text-poly-text">
              {health?.version || '0.1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div
            className="w-full sm:max-w-md p-6 sm:rounded-2xl rounded-t-2xl"
            style={{ backgroundColor: 'var(--poly-surface)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-poly-text">AI Configuration</h2>
              <button onClick={() => setShowConfigModal(false)}>
                <span className="material-symbols-outlined text-[24px] text-poly-text">close</span>
              </button>
            </div>

            <label className="block text-[11px] uppercase tracking-wider text-poly-muted mb-1">
              OpenAI API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 mb-4 text-[15px] text-poly-text border border-poly-border-muted outline-none focus:border-poly-accent"
              style={{ backgroundColor: 'var(--poly-bg)', borderRadius: '12px' }}
            />

            <label className="block text-[11px] uppercase tracking-wider text-poly-muted mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full p-3 mb-6 text-[15px] text-poly-text border border-poly-border-muted outline-none focus:border-poly-accent"
              style={{ backgroundColor: 'var(--poly-bg)', borderRadius: '12px' }}
            />

            <button
              onClick={handleSaveConfig}
              disabled={!apiKey.trim() || saving}
              className="w-full p-4 text-[14px] font-bold text-poly-accent-text bg-poly-accent disabled:opacity-50"
              style={{ borderRadius: '12px' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
