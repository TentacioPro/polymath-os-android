'use client';

import { useState } from 'react';
import {
  useMemories,
  useDeleteMemory,
  useLearnFromData,
  useConsolidateMemories,
  usePersona,
  useUpdatePersona,
  useLearningLogs,
  useChatWithAgent,
  useAgentStats,
} from '@/hooks/useAgent';
import { getMemoryTypeColor } from '@/lib/constants';
import {
  Brain,
  User,
  TrendingUp,
  BookOpen,
  Merge,
  MessageCircle,
  Trash2,
  Edit,
  X,
  Send,
  Lightbulb,
  Loader2,
  GraduationCap,
} from 'lucide-react';

type View = 'memories' | 'persona' | 'learning';

export default function AgentPage() {
  const [view, setView] = useState<View>('memories');
  const [chatModal, setChatModal] = useState(false);
  const [editPersonaModal, setEditPersonaModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');

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
  const chatWithAgent = useChatWithAgent();

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

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    const res = await chatWithAgent.mutateAsync(chatMessage);
    setChatResponse(res.response || JSON.stringify(res));
    setChatMessage('');
  };

  const tabs: { key: View; label: string; icon: React.ElementType }[] = [
    { key: 'memories', label: 'Memories', icon: Brain },
    { key: 'persona', label: 'Persona', icon: User },
    { key: 'learning', label: 'Learning', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-poly-card">
        <h1 className="text-2xl font-bold text-poly-text">Agent Memory</h1>
        <p className="text-sm text-poly-muted mt-1">Long-term learning assistant</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-poly-card px-4 pb-3">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
              view === key
                ? 'bg-poly-border text-poly-indigo'
                : 'text-poly-dim hover:text-poly-muted'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* MEMORIES VIEW */}
        {view === 'memories' && (
          <>
            {/* Stats */}
            <div className="bg-poly-card rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-poly-muted mb-3">Memory Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-poly-bg rounded-lg p-3 text-center">
                  <span className="text-2xl font-bold text-poly-indigo">
                    {agentStats?.total_memories || memories?.length || 0}
                  </span>
                  <p className="text-[11px] text-poly-muted mt-1">Total</p>
                </div>
                <div className="bg-poly-bg rounded-lg p-3 text-center">
                  <span className="text-2xl font-bold text-poly-indigo">
                    {agentStats?.long_term || 0}
                  </span>
                  <p className="text-[11px] text-poly-muted mt-1">Long-term</p>
                </div>
                <div className="bg-poly-bg rounded-lg p-3 text-center">
                  <span className="text-2xl font-bold text-poly-indigo">
                    {agentStats?.events || 0}
                  </span>
                  <p className="text-[11px] text-poly-muted mt-1">Events</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => learnFromData.mutate()}
                disabled={learnFromData.isPending}
                className="flex-1 bg-poly-indigo rounded-xl py-3 flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
              >
                {learnFromData.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <BookOpen size={16} />
                )}
                Learn
              </button>
              <button
                onClick={() => consolidateMemories.mutate()}
                disabled={consolidateMemories.isPending}
                className="flex-1 bg-poly-green rounded-xl py-3 flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold hover:bg-poly-green/90 transition-colors disabled:opacity-50"
              >
                {consolidateMemories.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Merge size={16} />
                )}
                Consolidate
              </button>
              <button
                onClick={() => setChatModal(true)}
                className="bg-poly-pink rounded-xl py-3 px-4 flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold hover:bg-poly-pink/90 transition-colors"
              >
                <MessageCircle size={16} />
                Chat
              </button>
            </div>

            {/* Memory Cards */}
            {memoriesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-poly-indigo border-t-transparent rounded-full animate-spin" />
              </div>
            ) : memories && memories.length > 0 ? (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-poly-card border border-poly-border rounded-xl p-4 group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className="text-[11px] font-bold text-white px-2.5 py-1 rounded-full uppercase"
                        style={{
                          backgroundColor: getMemoryTypeColor(memory.memory_type),
                        }}
                      >
                        {memory.memory_type.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => deleteMemory.mutate(memory.id)}
                        className="opacity-0 group-hover:opacity-100 text-poly-red hover:text-red-400 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-poly-light leading-relaxed mb-3">
                      {memory.content}
                    </p>

                    {/* Importance bar */}
                    <div className="space-y-2">
                      <div className="h-1 bg-poly-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-poly-indigo rounded-full"
                          style={{ width: `${(memory.importance || 0) * 100}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-poly-dim">
                        Accessed {memory.access_count || 0} times •{' '}
                        {new Date(memory.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Brain size={64} className="mx-auto text-poly-dim mb-4" />
                <p className="text-lg font-semibold text-poly-muted">No memories yet</p>
                <p className="text-sm text-poly-dim mt-2">
                  Click &quot;Learn&quot; to start building agent memory
                </p>
              </div>
            )}
          </>
        )}

        {/* PERSONA VIEW */}
        {view === 'persona' && (
          <div>
            {persona ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[28px] font-bold text-poly-text">
                      {persona.name || 'Unnamed'}
                    </h2>
                    <p className="text-base text-poly-indigo mt-1">
                      {persona.role || 'No role set'}
                    </p>
                  </div>
                  <button
                    onClick={openEditPersona}
                    className="bg-poly-card border border-poly-border rounded-xl p-2.5 text-poly-muted hover:text-poly-text transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                </div>

                {persona.focus_areas && persona.focus_areas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-poly-muted mb-2">
                      Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {persona.focus_areas.map((area, i) => (
                        <span
                          key={i}
                          className="bg-poly-indigo text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {persona.behavior_traits && persona.behavior_traits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-poly-muted mb-2">
                      Behavior Traits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {persona.behavior_traits.map((trait, i) => (
                        <span
                          key={i}
                          className="bg-poly-green text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {persona.custom_instructions && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-poly-muted mb-2">
                      Custom Instructions
                    </h3>
                    <div className="bg-poly-card border border-poly-border rounded-xl p-4">
                      <p className="text-sm text-poly-light leading-relaxed">
                        {persona.custom_instructions}
                      </p>
                    </div>
                  </div>
                )}

                {persona.updated_at && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-poly-muted mb-2">
                      Last Updated
                    </h3>
                    <p className="text-[11px] text-poly-dim">
                      {new Date(persona.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <User size={64} className="mx-auto text-poly-dim mb-4" />
                <p className="text-lg font-semibold text-poly-muted">
                  No persona configured
                </p>
                <p className="text-sm text-poly-dim mt-2">
                  Set up your agent&apos;s persona to personalize interactions
                </p>
                <button
                  onClick={openEditPersona}
                  className="mt-4 bg-poly-indigo rounded-xl px-6 py-3 text-sm font-semibold text-white hover:bg-poly-indigo/90 transition-colors"
                >
                  Create Persona
                </button>
              </div>
            )}
          </div>
        )}

        {/* LEARNING VIEW */}
        {view === 'learning' && (
          <div>
            <h2 className="text-lg font-bold text-poly-text mb-1">
              Learning Progression
            </h2>
            <p className="text-[13px] text-poly-muted mb-4">
              Track how the agent learns and improves over time
            </p>

            {logsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-poly-indigo border-t-transparent rounded-full animate-spin" />
              </div>
            ) : learningLogs && learningLogs.length > 0 ? (
              <div className="space-y-3">
                {learningLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="bg-poly-card border border-poly-border rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <Lightbulb size={24} className="text-poly-amber" />
                      <span className="text-xs text-poly-muted">
                        {new Date(log.learned_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-poly-light leading-relaxed mb-2">
                      {log.insight}
                    </p>
                    {log.source_data?.type && (
                      <p className="text-xs text-poly-dim italic">
                        Source: {log.source_data.type}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <GraduationCap size={64} className="mx-auto text-poly-dim mb-4" />
                <p className="text-lg font-semibold text-poly-muted">
                  No learning logs yet
                </p>
                <p className="text-sm text-poly-dim mt-2">
                  Agent will learn from your interactions
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Persona Modal */}
      {editPersonaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-poly-card rounded-t-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-poly-text">Edit Persona</h2>
              <button onClick={() => setEditPersonaModal(false)}>
                <X size={28} className="text-poly-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Name
                </label>
                <input
                  value={personaForm.name}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, name: e.target.value })
                  }
                  placeholder="Learning Assistant"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Role
                </label>
                <input
                  value={personaForm.role}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, role: e.target.value })
                  }
                  placeholder="Polymath Guide"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
                  Focus Areas (comma-separated)
                </label>
                <input
                  value={personaForm.focus_areas}
                  onChange={(e) =>
                    setPersonaForm({ ...personaForm, focus_areas: e.target.value })
                  }
                  placeholder="AI, Technology, Learning"
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
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
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-poly-light mb-2 block">
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
                  className="w-full bg-poly-bg border border-poly-border rounded-xl px-4 py-3 text-base text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo resize-none"
                />
              </div>

              <button
                onClick={handleUpdatePersona}
                disabled={updatePersona.isPending}
                className="w-full bg-poly-indigo rounded-xl py-4 text-base font-semibold text-white hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
              >
                {updatePersona.isPending ? 'Saving...' : 'Save Persona'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
          <div className="bg-poly-card rounded-t-3xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-poly-text">Chat with Agent</h2>
              <button onClick={() => setChatModal(false)}>
                <X size={28} className="text-poly-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 max-h-[300px]">
              {chatResponse && (
                <div className="bg-poly-bg border border-poly-indigo rounded-xl p-4 flex gap-3">
                  <MessageCircle size={20} className="text-poly-indigo shrink-0 mt-0.5" />
                  <p className="text-sm text-poly-light leading-relaxed flex-1">
                    {chatResponse}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-end">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask your learning assistant..."
                rows={2}
                className="flex-1 bg-poly-bg border border-poly-border rounded-xl px-3 py-3 text-sm text-poly-text placeholder:text-poly-dim focus:outline-none focus:border-poly-indigo resize-none max-h-[100px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
              />
              <button
                onClick={handleChat}
                disabled={chatWithAgent.isPending || !chatMessage.trim()}
                className="bg-poly-indigo rounded-xl p-3 w-12 h-12 flex items-center justify-center text-white hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
              >
                {chatWithAgent.isPending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
