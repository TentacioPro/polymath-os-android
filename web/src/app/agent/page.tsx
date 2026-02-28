'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useMemories,
  useDeleteMemory,
  useLearnFromData,
  useConsolidateMemories,
  usePersona,
  useUpdatePersona,
  useLearningLogs,
  useAgentStats,
} from '@/hooks/useAgent';
import { getMemoryTypeColor } from '@/lib/constants';
import ResponsiveModal from '@/components/ResponsiveModal';

type View = 'memories' | 'persona' | 'learning';

export default function AgentPage() {
  const [view, setView] = useState<View>('memories');
  const [editPersonaModal, setEditPersonaModal] = useState(false);

  // Persona form
  const [personaForm, setPersonaForm] = useState({
    name: '',
    role: '',
    focus_areas: '',
    behavior_traits: '',
    custom_instructions: '',
  });

  // Data hooks
  const { data: memories, isLoading: memoriesLoading } = useMemories();
  const { data: persona } = usePersona();
  const { data: learningLogs, isLoading: logsLoading } = useLearningLogs();
  const { data: agentStats } = useAgentStats();

  const deleteMemory = useDeleteMemory();
  const learnFromData = useLearnFromData();
  const consolidateMemories = useConsolidateMemories();
  const updatePersona = useUpdatePersona();

  const openEditPersona = () => {
    if (persona) {
      setPersonaForm({
        name: persona.name || '',
        role: persona.role || '',
        focus_areas: persona.focus_areas?.join(', ') || '',
        behavior_traits: persona.behavior_traits?.join(', ') || '',
        custom_instructions: persona.custom_instructions || '',
      });
    }
    setEditPersonaModal(true);
  };

  const handleUpdatePersona = async () => {
    await updatePersona.mutateAsync({
      name: personaForm.name,
      role: personaForm.role,
      focus_areas: personaForm.focus_areas.split(',').map((s) => s.trim()).filter(Boolean),
      behavior_traits: personaForm.behavior_traits.split(',').map((s) => s.trim()).filter(Boolean),
      custom_instructions: personaForm.custom_instructions,
    });
    setEditPersonaModal(false);
  };

  const tabs: { key: View; label: string; icon: string }[] = [
    { key: 'memories', label: 'Memory', icon: 'memory' },
    { key: 'persona', label: 'Persona', icon: 'person' },
    { key: 'learning', label: 'Learning', icon: 'trending_up' },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
            Agent Memory
          </h1>
          <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
            System // Neural Core
          </p>
        </div>
        <Link
          href="/chat"
          className="bg-poly-accent text-poly-accent-text px-3 py-2 flex items-center gap-2 transition-colors hover:opacity-80"
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
            Chat
          </span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-poly-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-colors border-r border-poly-border last:border-r-0 ${
              view === tab.key
                ? 'bg-poly-accent text-poly-accent-text'
                : 'text-poly-muted hover:text-poly-text'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MEMORIES VIEW */}
      {view === 'memories' && (
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="border border-poly-border bg-poly-surface p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-poly-muted">
                Memory Allocation
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-poly-border-muted p-3 text-center">
                <span className="text-xl font-display font-bold text-poly-accent block">
                  {agentStats?.total_memories || memories?.length || 0}
                </span>
                <p className="text-[9px] font-mono text-poly-muted mt-1 uppercase">Total</p>
              </div>
              <div className="border border-poly-border-muted p-3 text-center">
                <span className="text-xl font-display font-bold text-poly-accent block">
                  {agentStats?.long_term || 0}
                </span>
                <p className="text-[9px] font-mono text-poly-muted mt-1 uppercase">Long-term</p>
              </div>
              <div className="border border-poly-border-muted p-3 text-center">
                <span className="text-xl font-display font-bold text-poly-accent block">
                  {agentStats?.events || 0}
                </span>
                <p className="text-[9px] font-mono text-poly-muted mt-1 uppercase">Events</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => learnFromData.mutate()}
              disabled={learnFromData.isPending}
              className="bg-poly-accent text-poly-accent-text py-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {learnFromData.isPending ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">
                  school
                </span>
              )}
              Learn
            </button>
            <button
              onClick={() => consolidateMemories.mutate()}
              disabled={consolidateMemories.isPending}
              className="border border-poly-border text-poly-text py-3 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-poly-accent hover:text-poly-accent-text transition-colors disabled:opacity-50"
            >
              {consolidateMemories.isPending ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">
                  merge
                </span>
              )}
              Consolidate
            </button>
          </div>

          {/* Memory Cards */}
          {memoriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
            </div>
          ) : memories && memories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="border border-poly-border bg-poly-surface p-4 group flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase"
                      style={{
                        backgroundColor: getMemoryTypeColor(memory.memory_type),
                        color: '#FFFFFF',
                      }}
                    >
                      {memory.memory_type.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => deleteMemory.mutate(memory.id)}
                      className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <p className="text-xs text-poly-light leading-relaxed mb-3">
                    {memory.content}
                  </p>

                  {/* Importance bar */}
                  <div className="space-y-2 mt-auto pt-2">
                    <div className="h-0.5 bg-poly-border-muted overflow-hidden">
                      <div
                        className="h-full bg-poly-accent"
                        style={{ width: `${(memory.importance || 0) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] font-mono text-poly-dim uppercase">
                      Accessed {memory.access_count || 0}x &middot;{' '}
                      {new Date(memory.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-poly-border-muted">
              <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
                memory
              </span>
              <p className="text-sm font-display font-bold text-poly-muted uppercase">
                No memories yet
              </p>
              <p className="text-[10px] font-mono text-poly-dim mt-2">
                Click &quot;Learn&quot; to start building agent memory
              </p>
            </div>
          )}
        </div>
      )}

      {/* PERSONA VIEW */}
      {view === 'persona' && (
        <div className="flex flex-col gap-6">
          {persona ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-display font-bold text-poly-text uppercase">
                    {persona.name || 'Unnamed'}
                  </h2>
                  <p className="text-xs font-mono text-poly-accent mt-1 uppercase tracking-widest">
                    {persona.role || 'No role set'}
                  </p>
                </div>
                <button
                  onClick={openEditPersona}
                  className="w-8 h-8 flex items-center justify-center border border-poly-border hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-muted"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              {persona.focus_areas && persona.focus_areas.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-mono font-bold text-poly-muted mb-2 uppercase tracking-widest">
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.focus_areas.map((area, i) => (
                      <span
                        key={i}
                        className="bg-poly-accent text-poly-accent-text text-[10px] font-mono font-bold px-3 py-1.5 uppercase"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.behavior_traits && persona.behavior_traits.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-mono font-bold text-poly-muted mb-2 uppercase tracking-widest">
                    Behavior Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.behavior_traits.map((trait, i) => (
                      <span
                        key={i}
                        className="border border-poly-border text-poly-text text-[10px] font-mono font-bold px-3 py-1.5 uppercase"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.custom_instructions && (
                <div>
                  <h3 className="text-[10px] font-mono font-bold text-poly-muted mb-2 uppercase tracking-widest">
                    Directives
                  </h3>
                  <div className="border border-poly-border bg-poly-surface p-4">
                    <p className="text-xs text-poly-light leading-relaxed font-mono">
                      {persona.custom_instructions}
                    </p>
                  </div>
                </div>
              )}

              {persona.updated_at && (
                <p className="text-[9px] font-mono text-poly-dim uppercase">
                  Last synced: {new Date(persona.updated_at).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-16 border border-poly-border-muted">
              <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
                person
              </span>
              <p className="text-sm font-display font-bold text-poly-muted uppercase">
                No persona configured
              </p>
              <p className="text-[10px] font-mono text-poly-dim mt-2 mb-4">
                Set up your agent&apos;s persona to personalize interactions
              </p>
              <button
                onClick={openEditPersona}
                className="bg-poly-accent text-poly-accent-text px-6 py-3 font-mono text-[10px] uppercase tracking-widest font-bold hover:opacity-80 transition-opacity"
              >
                Create Persona
              </button>
            </div>
          )}
        </div>
      )}

      {/* LEARNING VIEW */}
      {view === 'learning' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-poly-text">
              Learning Progression
            </h3>
            <span className="text-[10px] font-mono text-poly-muted">
              {learningLogs?.length || 0} LOGS
            </span>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
            </div>
          ) : learningLogs && learningLogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learningLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="border border-poly-border bg-poly-surface p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="material-symbols-outlined text-[20px] text-poly-amber">
                      lightbulb
                    </span>
                    <span className="text-[9px] font-mono text-poly-muted uppercase">
                      {new Date(log.learned_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-poly-light leading-relaxed mb-2">
                    {log.insight}
                  </p>
                  {log.source_data?.type && (
                    <p className="text-[9px] font-mono text-poly-dim uppercase">
                      Source: {log.source_data.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-poly-border-muted">
              <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
                school
              </span>
              <p className="text-sm font-display font-bold text-poly-muted uppercase">
                No learning logs yet
              </p>
              <p className="text-[10px] font-mono text-poly-dim mt-2">
                Agent will learn from your interactions
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Persona Modal */}
      <ResponsiveModal open={editPersonaModal} onClose={() => setEditPersonaModal(false)} title="Edit Persona" maxWidth="max-w-xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
                  Name
                </label>
                <input
                  value={personaForm.name}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, name: e.target.value })
                  }
                  placeholder="Learning Assistant"
                  className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
                  Role
                </label>
                <input
                  value={personaForm.role}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, role: e.target.value })
                  }
                  placeholder="Polymath Guide"
                  className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
                />
              </div>
            </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
                  Focus Areas (comma-separated)
                </label>
                <input
                  value={personaForm.focus_areas}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, focus_areas: e.target.value })
                  }
                  placeholder="AI, Technology, Learning"
                  className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
                  Behavior Traits (comma-separated)
                </label>
                <input
                  value={personaForm.behavior_traits}
                  onChange={(e) =>
                    setPersonaForm({
                      ...personaForm,
                      behavior_traits: e.target.value,
                    })
                  }
                  placeholder="Curious, Analytical, Supportive"
                  className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-poly-muted mb-2 block uppercase tracking-widest">
                  Custom Instructions
                </label>
                <textarea
                  value={personaForm.custom_instructions}
                  onChange={(e) =>
                    setPersonaForm({
                      ...personaForm,
                      custom_instructions: e.target.value,
                    })
                  }
                  placeholder="How should the agent behave?"
                  rows={6}
                  className="w-full bg-poly-bg border border-poly-border px-4 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-accent resize-none font-mono"
                />
              </div>

              <button
                onClick={handleUpdatePersona}
                disabled={updatePersona.isPending}
                className="w-full bg-poly-accent text-poly-accent-text py-3 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 architect-shadow-sm"
              >
                {updatePersona.isPending ? 'Saving...' : 'Save Persona'}
              </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
