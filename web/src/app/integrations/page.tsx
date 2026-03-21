'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

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
  const toast = useToast();

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
      toast.success('AI configuration saved');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save configuration');
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
    isGood,
    onClick,
  }: {
    icon: string;
    label: string;
    desc: string;
    status: string;
    isGood: boolean;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container ${
        onClick ? 'cursor-pointer hover:bg-m3-surface-container-high transition-standard' : ''
      }`}
    >
      <div
        className={`w-11 h-11 flex items-center justify-center shrink-0 rounded-xl ${
          isGood ? 'bg-m3-success-container' : 'bg-m3-error-container'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[20px] ${
            isGood ? 'text-m3-success' : 'text-m3-error'
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-m3-on-surface">{label}</p>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5 truncate">{desc}</p>
      </div>
      <div
        className={`px-2.5 py-1 shrink-0 rounded-full ${
          isGood ? 'bg-m3-success-container' : 'bg-m3-error-container'
        }`}
      >
        <span
          className={`text-[9px] font-bold tracking-wider ${
            isGood ? 'text-m3-success' : 'text-m3-error'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight">Integrations</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">System configuration</p>
      </div>

      {/* System Health */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">
          SYSTEM HEALTH
        </p>
        <div className="flex flex-col gap-2">
          <StatusCard
            icon="storage"
            label="Database"
            desc={`MongoDB — ${health?.database || 'unknown'}`}
            status={dbStatus ? 'ONLINE' : 'OFFLINE'}
            isGood={dbStatus}
          />
          <StatusCard
            icon="memory"
            label="Backend"
            desc={`v${health?.version || '0.1.0'} — ${health?.status || 'unknown'}`}
            status={health?.status === 'operational' ? 'RUNNING' : 'CHECK'}
            isGood={health?.status === 'operational'}
          />
        </div>
      </div>

      {/* Security Status */}
      {health?.security && (
        <div>
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">
            SECURITY
          </p>
          <div className="flex flex-col gap-2">
            <StatusCard
              icon="shield"
              label="CORS Policy"
              desc={`Mode: ${health.security.cors_mode}`}
              status={health.security.cors_mode === 'restricted' ? 'SECURE' : 'OPEN'}
              isGood={health.security.cors_mode === 'restricted'}
            />
            <StatusCard
              icon="speed"
              label="Rate Limiting"
              desc={health.security.rate_limiting ? 'Active' : 'Disabled'}
              status={health.security.rate_limiting ? 'ON' : 'OFF'}
              isGood={health.security.rate_limiting}
            />
            <StatusCard
              icon="key"
              label="API Authentication"
              desc={health.security.auth_required ? 'Required' : 'Not required'}
              status={health.security.auth_required ? 'REQUIRED' : 'OPEN'}
              isGood={health.security.auth_required}
            />
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">
          AI CONFIGURATION
        </p>
        <div className="flex flex-col gap-2">
          <StatusCard
            icon="psychology"
            label="OpenAI"
            desc={aiConfigured ? `Model: ${config?.model || 'gpt-4o-mini'}` : 'Not configured'}
            status={aiConfigured ? 'ACTIVE' : 'SETUP'}
            isGood={!!aiConfigured}
            onClick={() => setShowConfigModal(true)}
          />
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">
          INFO
        </p>
        <div className="p-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-m3-on-surface-variant">Environment</span>
            <span className="text-[13px] font-semibold text-m3-on-surface">
              {health?.environment || 'development'}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-m3-on-surface-variant">Backend URL</span>
            <span className="text-[13px] font-semibold text-m3-on-surface truncate max-w-50">
              {process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8001'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-m3-on-surface-variant">Version</span>
            <span className="text-[13px] font-semibold text-m3-on-surface">
              {health?.version || '0.1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
          style={{ backgroundColor: 'var(--m3-scrim)' }}
        >
          <div className="w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl bg-m3-surface-container elevation-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-m3-on-surface">AI Configuration</h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-m3-surface-container-high transition-standard"
              >
                <span className="material-symbols-outlined text-[24px] text-m3-on-surface">close</span>
              </button>
            </div>

            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1">
              OpenAI API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 mb-4 text-[15px] text-m3-on-surface rounded-2xl border border-m3-outline-variant bg-m3-surface outline-none focus:border-m3-primary transition-standard placeholder:text-m3-on-surface-variant"
            />

            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full p-3 mb-6 text-[15px] text-m3-on-surface rounded-2xl border border-m3-outline-variant bg-m3-surface outline-none focus:border-m3-primary transition-standard placeholder:text-m3-on-surface-variant"
            />

            <button
              onClick={handleSaveConfig}
              disabled={!apiKey.trim() || saving}
              className="w-full p-4 text-[14px] font-bold rounded-2xl text-m3-on-primary bg-m3-primary disabled:opacity-50 hover:opacity-90 transition-standard"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
