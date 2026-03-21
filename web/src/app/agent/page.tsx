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
import ResponsiveModal from '@/components/ResponsiveModal';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';

type View = 'memories' | 'persona' | 'learning';

/* M3 memory type badge colors using Tailwind classes */
const MEMORY_TYPE_STYLES: Record<string, string> = {
  short_term: 'bg-blue-500/20 text-blue-400',
  long_term: 'bg-emerald-500/20 text-emerald-400',
  insight: 'bg-amber-500/20 text-amber-400',
  pattern: 'bg-pink-500/20 text-pink-400',
  archived: 'bg-gray-500/20 text-gray-400',
};

const getMemoryStyle = (type: string) =>
  MEMORY_TYPE_STYLES[type] || MEMORY_TYPE_STYLES.archived;

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
  const toast = useToast();
  const { confirm } = useConfirm();

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
    try {
      await updatePersona.mutateAsync({
        name: personaForm.name,
        role: personaForm.role,
        focus_areas: personaForm.focus_areas.split(',').map((s) => s.trim()).filter(Boolean),
        behavior_traits: personaForm.behavior_traits.split(',').map((s) => s.trim()).filter(Boolean),
        custom_instructions: personaForm.custom_instructions,
      });
      setEditPersonaModal(false);
      toast.success('Persona updated');
    } catch {
      toast.error('Failed to update persona');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Memory',
      message: 'This memory will be permanently removed. Continue?',
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'delete',
    });
    if (!ok) return;
    try {
      await deleteMemory.mutateAsync(id);
      toast.success('Memory deleted');
    } catch {
      toast.error('Failed to delete memory');
    }
  };

  const handleLearn = async () => {
    try {
      await learnFromData.mutateAsync();
      toast.success('Learning complete');
    } catch {
      toast.error('Learning failed');
    }
  };

  const handleConsolidate = async () => {
    try {
      await consolidateMemories.mutateAsync();
      toast.success('Memories consolidated');
    } catch {
      toast.error('Consolidation failed');
    }
  };

  const tabs: { key: View; label: string; icon: string }[] = [
    { key: 'memories', label: 'Memory', icon: 'memory' },
    { key: 'persona', label: 'Persona', icon: 'person' },
    { key: 'learning', label: 'Learning', icon: 'trending_up' },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6 stagger-children">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-m3-on-surface tracking-tight">
            Agent Memory
          </h1>
          <p className="text-[11px] text-m3-on-surface-variant tracking-wide mt-1">
            System // Neural Core
          </p>
        </div>
        <Link
          href="/chat"
          className="bg-m3-primary text-m3-on-primary px-4 py-2.5 flex items-center gap-2 rounded-2xl transition-standard hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          <span className="text-[11px] uppercase tracking-wider font-bold">Chat</span>
        </Link>
      </div>

      {/* Tabs — M3 segmented button */}
      <div className="flex gap-0 rounded-2xl border border-m3-outline overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wide font-bold transition-standard border-r border-m3-outline last:border-r-0 ${
              view === tab.key
                ? 'bg-m3-primary text-m3-on-primary'
                : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high'
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
          <div className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] tracking-wide text-m3-on-surface-variant">
                Memory Allocation
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-m3-outline-variant p-3 text-center">
                <span className="text-xl font-bold text-m3-primary block">
                  {agentStats?.total_memories || memories?.length || 0}
                </span>
                <p className="text-[9px] text-m3-on-surface-variant mt-1">Total</p>
              </div>
              <div className="rounded-xl border border-m3-outline-variant p-3 text-center">
                <span className="text-xl font-bold text-m3-primary block">
                  {agentStats?.long_term || 0}
                </span>
                <p className="text-[9px] text-m3-on-surface-variant mt-1">Long-term</p>
              </div>
              <div className="rounded-xl border border-m3-outline-variant p-3 text-center">
                <span className="text-xl font-bold text-m3-primary block">
                  {agentStats?.events || 0}
                </span>
                <p className="text-[9px] text-m3-on-surface-variant mt-1">Events</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLearn}
              disabled={learnFromData.isPending}
              className="bg-m3-primary text-m3-on-primary py-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-wide font-bold rounded-2xl hover:opacity-90 transition-standard disabled:opacity-50"
            >
              {learnFromData.isPending ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">school</span>
              )}
              Learn
            </button>
            <button
              onClick={handleConsolidate}
              disabled={consolidateMemories.isPending}
              className="border border-m3-outline text-m3-on-surface py-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-wide font-bold rounded-2xl hover:bg-m3-primary hover:text-m3-on-primary transition-standard disabled:opacity-50"
            >
              {consolidateMemories.isPending ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">merge</span>
              )}
              Consolidate
            </button>
          </div>

          {/* Memory Cards */}
          {memoriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : memories && memories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4 group flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase ${getMemoryStyle(memory.memory_type)}`}
                    >
                      {memory.memory_type.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="opacity-0 group-hover:opacity-100 text-m3-error hover:text-red-400 transition-standard"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <p className="text-xs text-m3-on-surface leading-relaxed mb-3">
                    {memory.content}
                  </p>

                  {/* Importance bar */}
                  <div className="space-y-2 mt-auto pt-2">
                    <div className="h-0.5 bg-m3-outline-variant overflow-hidden rounded-full">
                      <div
                        className="h-full bg-m3-primary rounded-full"
                        style={{ width: `${(memory.importance || 0) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-m3-on-surface-variant uppercase">
                      Accessed {memory.access_count || 0}x &middot;{' '}
                      {new Date(memory.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-m3-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-m3-on-surface-variant mb-4 block">
                memory
              </span>
              <p className="text-sm font-bold text-m3-on-surface-variant uppercase">
                No memories yet
              </p>
              <p className="text-[10px] text-m3-on-surface-variant mt-2">
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
                  <h2 className="text-2xl font-bold text-m3-on-surface uppercase">
                    {persona.name || 'Unnamed'}
                  </h2>
                  <p className="text-xs text-m3-primary mt-1 uppercase tracking-wide">
                    {persona.role || 'No role set'}
                  </p>
                </div>
                <button
                  onClick={openEditPersona}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-m3-outline hover:bg-m3-primary hover:text-m3-on-primary text-m3-on-surface-variant transition-standard"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              </div>

              {persona.focus_areas && persona.focus_areas.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-medium text-m3-on-surface-variant mb-2 uppercase tracking-wide">
                    Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.focus_areas.map((area, i) => (
                      <span
                        key={i}
                        className="bg-m3-primary text-m3-on-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.behavior_traits && persona.behavior_traits.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-medium text-m3-on-surface-variant mb-2 uppercase tracking-wide">
                    Behavior Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.behavior_traits.map((trait, i) => (
                      <span
                        key={i}
                        className="border border-m3-outline text-m3-on-surface text-[10px] font-bold px-3 py-1.5 rounded-full uppercase"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.custom_instructions && (
                <div>
                  <h3 className="text-[11px] font-medium text-m3-on-surface-variant mb-2 uppercase tracking-wide">
                    Directives
                  </h3>
                  <div className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4">
                    <p className="text-xs text-m3-on-surface leading-relaxed">
                      {persona.custom_instructions}
                    </p>
                  </div>
                </div>
              )}

              {persona.updated_at && (
                <p className="text-[9px] text-m3-on-surface-variant uppercase">
                  Last synced: {new Date(persona.updated_at).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-m3-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-m3-on-surface-variant mb-4 block">
                person
              </span>
              <p className="text-sm font-bold text-m3-on-surface-variant uppercase">
                No persona configured
              </p>
              <p className="text-[10px] text-m3-on-surface-variant mt-2 mb-4">
                Set up your agent&apos;s persona to personalize interactions
              </p>
              <button
                onClick={openEditPersona}
                className="bg-m3-primary text-m3-on-primary px-6 py-3 text-[11px] uppercase tracking-wide font-bold rounded-2xl hover:opacity-90 transition-standard"
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
            <h3 className="text-sm uppercase tracking-wide font-bold text-m3-on-surface">
              Learning Progression
            </h3>
            <span className="text-[10px] text-m3-on-surface-variant">
              {learningLogs?.length || 0} LOGS
            </span>
          </div>

          {logsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : learningLogs && learningLogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learningLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="material-symbols-outlined text-[20px] text-amber-400">
                      lightbulb
                    </span>
                    <span className="text-[9px] text-m3-on-surface-variant uppercase">
                      {new Date(log.learned_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-m3-on-surface leading-relaxed mb-2">
                    {log.insight}
                  </p>
                  {log.source_data?.type && (
                    <p className="text-[9px] text-m3-on-surface-variant uppercase">
                      Source: {log.source_data.type}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-m3-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-m3-on-surface-variant mb-4 block">
                school
              </span>
              <p className="text-sm font-bold text-m3-on-surface-variant uppercase">
                No learning logs yet
              </p>
              <p className="text-[10px] text-m3-on-surface-variant mt-2">
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
              <label className="text-[11px] font-medium text-m3-on-surface-variant mb-2 block uppercase tracking-wide">
                Name
              </label>
              <input
                value={personaForm.name}
                onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })}
                placeholder="Learning Assistant"
                className="w-full bg-m3-surface border border-m3-outline-variant px-4 py-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant rounded-2xl focus:outline-none focus:border-m3-primary transition-standard"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-m3-on-surface-variant mb-2 block uppercase tracking-wide">
                Role
              </label>
              <input
                value={personaForm.role}
                onChange={(e) => setPersonaForm({ ...personaForm, role: e.target.value })}
                placeholder="Polymath Guide"
                className="w-full bg-m3-surface border border-m3-outline-variant px-4 py-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant rounded-2xl focus:outline-none focus:border-m3-primary transition-standard"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-m3-on-surface-variant mb-2 block uppercase tracking-wide">
              Focus Areas (comma-separated)
            </label>
            <input
              value={personaForm.focus_areas}
              onChange={(e) => setPersonaForm({ ...personaForm, focus_areas: e.target.value })}
              placeholder="AI, Technology, Learning"
              className="w-full bg-m3-surface border border-m3-outline-variant px-4 py-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant rounded-2xl focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-m3-on-surface-variant mb-2 block uppercase tracking-wide">
              Behavior Traits (comma-separated)
            </label>
            <input
              value={personaForm.behavior_traits}
              onChange={(e) => setPersonaForm({ ...personaForm, behavior_traits: e.target.value })}
              placeholder="Curious, Analytical, Supportive"
              className="w-full bg-m3-surface border border-m3-outline-variant px-4 py-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant rounded-2xl focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-m3-on-surface-variant mb-2 block uppercase tracking-wide">
              Custom Instructions
            </label>
            <textarea
              value={personaForm.custom_instructions}
              onChange={(e) => setPersonaForm({ ...personaForm, custom_instructions: e.target.value })}
              placeholder="How should the agent behave?"
              rows={6}
              className="w-full bg-m3-surface border border-m3-outline-variant px-4 py-3 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant rounded-2xl resize-none focus:outline-none focus:border-m3-primary transition-standard"
            />
          </div>

          <button
            onClick={handleUpdatePersona}
            disabled={updatePersona.isPending}
            className="w-full bg-m3-primary text-m3-on-primary py-3 text-xs uppercase tracking-wide font-bold rounded-2xl hover:opacity-90 transition-standard disabled:opacity-50"
          >
            {updatePersona.isPending ? 'Saving...' : 'Save Persona'}
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
