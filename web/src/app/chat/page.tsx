'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatWithAgent, usePersona, useAgentStats } from '@/hooks/useAgent';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const SESSIONS_KEY = 'polymath-chat-sessions';

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function sessionTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New Conversation';
  return first.content.length > 50
    ? first.content.slice(0, 50) + '…'
    : first.content;
}

function formatSessionDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const SUGGESTED_PROMPTS = [
  { icon: 'auto_awesome', text: 'Summarize my recent learning activity' },
  { icon: 'hub', text: 'What connections exist across my topics?' },
  { icon: 'psychology', text: 'What patterns do you see in my knowledge?' },
  { icon: 'lightbulb', text: 'Suggest areas I should explore next' },
  { icon: 'trending_up', text: 'How has my learning evolved recently?' },
  { icon: 'category', text: 'What are my strongest knowledge domains?' },
];

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const chatWithAgent = useChatWithAgent();
  const { data: persona } = usePersona();
  const { data: agentStats } = useAgentStats();
  const { collapsed } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const now = new Date().toISOString();
    setSessions((prev) => {
      let updated: ChatSession[];
      if (currentSessionId) {
        updated = prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                title: sessionTitle(messages),
                preview:
                  messages[messages.length - 1]?.content.slice(0, 80) || '',
                messageCount: messages.length,
                updatedAt: now,
                messages: messages.map((m) => ({ ...m, timestamp: m.timestamp })),
              }
            : s
        );
      } else {
        const id = 'session-' + Date.now();
        setCurrentSessionId(id);
        updated = [
          {
            id,
            title: sessionTitle(messages),
            preview:
              messages[messages.length - 1]?.content.slice(0, 80) || '',
            messageCount: messages.length,
            createdAt: now,
            updatedAt: now,
            messages: messages.map((m) => ({ ...m, timestamp: m.timestamp })),
          },
          ...prev,
        ];
      }
      saveSessions(updated);
      return updated;
    });
  }, [messages, currentSessionId]);

  const loadSession = useCallback((session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(
      session.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
    );
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });
    setCurrentSessionId((prev) => (prev === sessionId ? null : prev));
    setMessages((prev) => {
      if (sessionId === currentSessionId) return [];
      return prev;
    });
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || chatWithAgent.isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await chatWithAgent.mutateAsync(content);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response || JSON.stringify(res),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const clearChat = () => setMessages([]);

  const hasMessages = messages.length > 0;

  return (
    <div className={`fixed inset-0 flex bg-m3-surface z-30 pt-[60px] md:pt-0 transition-standard ${collapsed ? 'md:pl-18' : 'md:pl-65'}`}>
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="border-b border-m3-outline-variant bg-m3-surface px-5 md:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-m3-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-m3-on-primary-container">
                smart_toy
              </span>
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-m3-on-surface tracking-tight leading-none">
                {persona?.name || 'Polymath Agent'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-m3-success rounded-full" />
                <span className="text-[10px] text-m3-on-surface-variant tracking-wide">
                  {persona?.role || 'Learning Assistant'} · Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasMessages && (
              <span className="text-[10px] text-m3-on-surface-variant tracking-wide mr-2 hidden md:inline">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            )}
            <Link
              href="/agent"
              className="p-2 rounded-lg text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface transition-standard"
              title="Agent Memory"
            >
              <span className="material-symbols-outlined text-[20px]">memory</span>
            </Link>
            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface transition-standard"
              title="Clear Chat"
            >
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
            </button>
          </div>
        </div>

        {/* Messages / Empty State */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 lg:px-12 py-6">
          {!hasMessages ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-m3-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] text-m3-on-primary-container">
                    smart_toy
                  </span>
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold text-m3-on-surface tracking-tight leading-none">
                    {persona?.name || 'Polymath Agent'}
                  </h2>
                  <p className="text-[10px] text-m3-on-surface-variant tracking-wide mt-0.5">
                    {persona?.role || 'Learning Assistant'} · Ready
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => sendMessage(prompt.text)}
                    disabled={chatWithAgent.isPending}
                    className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-3 flex items-start gap-2.5 hover:bg-m3-surface-container-high hover:border-m3-primary transition-standard text-left group disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px] text-m3-primary shrink-0 mt-px">
                      {prompt.icon}
                    </span>
                    <span className="text-[11px] text-m3-on-surface-variant leading-relaxed group-hover:text-m3-on-surface transition-standard">
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-m3-on-surface-variant tracking-wide mt-5">
                Select a prompt or type below
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[65%] flex gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${
                        msg.role === 'user'
                          ? 'bg-m3-surface-container-high'
                          : 'bg-m3-primary-container'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          msg.role === 'user' ? 'text-m3-on-surface-variant' : 'text-m3-on-primary-container'
                        }`}
                      >
                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div>
                      <div
                        className={`p-4 ${
                          msg.role === 'user'
                            ? 'bg-m3-primary text-m3-on-primary rounded-[16px_16px_4px_16px]'
                            : 'bg-m3-surface-container-high text-m3-on-surface rounded-[16px_16px_16px_4px]'
                        }`}
                      >
                        <p className="text-[13px] leading-[1.7] whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <p
                        className={`text-[9px] tracking-wide mt-1.5 px-1 text-m3-on-surface-variant ${
                          msg.role === 'user' ? 'text-right' : ''
                        }`}
                      >
                        {msg.role === 'assistant' ? `${persona?.name || 'Agent'} · ` : ''}
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {chatWithAgent.isPending && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-m3-primary-container flex items-center justify-center mt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-m3-on-primary-container">
                        smart_toy
                      </span>
                    </div>
                    <div className="bg-m3-surface-container-high p-4 rounded-[16px_16px_16px_4px]">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-m3-primary rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-m3-primary rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-m3-primary rounded-full animate-bounce [animation-delay:300ms]" />
                        <span className="text-[9px] text-m3-on-surface-variant tracking-wide ml-2">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-m3-outline-variant bg-m3-surface px-5 md:px-8 lg:px-12 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything about your knowledge base..."
                  rows={1}
                  className="w-full bg-m3-surface-container border border-m3-outline-variant rounded-2xl px-4 py-3.5 pr-12 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant focus:outline-none focus:border-m3-primary transition-standard resize-none max-h-40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={chatWithAgent.isPending || !input.trim()}
                  className="absolute right-2 bottom-2 bg-m3-primary text-m3-on-primary w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-90 transition-standard disabled:opacity-30 shrink-0"
                >
                  {chatWithAgent.isPending ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-m3-on-surface-variant tracking-wide hidden md:block">
                Enter to send · Shift+Enter for new line
              </span>
              <span className="text-[9px] text-m3-on-surface-variant tracking-wide">
                Polymath Agent v1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Right Panel: Chat Sessions History */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-m3-outline-variant bg-m3-surface shrink-0">
        {/* Panel Header */}
        <div className="px-5 py-3.5 border-b border-m3-outline-variant flex items-center justify-between">
          <p className="text-xs font-semibold text-m3-on-surface uppercase tracking-wider">
            History
          </p>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-m3-outline-variant hover:bg-m3-primary-container hover:border-m3-primary text-m3-on-surface-variant hover:text-m3-on-primary-container transition-standard"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">New</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-[28px] text-m3-outline-variant mb-3">
                forum
              </span>
              <p className="text-xs text-m3-on-surface-variant tracking-wide">
                No conversations yet
              </p>
              <p className="text-[11px] text-m3-on-surface-variant mt-1.5 leading-relaxed">
                Your chat sessions will appear here
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                return (
                  <button
                    key={session.id}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-standard group ${
                      isActive
                        ? 'bg-m3-primary-container'
                        : 'hover:bg-m3-surface-container-high'
                    }`}
                    onClick={() => loadSession(session)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-[13px] font-semibold leading-snug line-clamp-1 ${
                        isActive ? 'text-m3-on-primary-container' : 'text-m3-on-surface'
                      }`}>
                        {session.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-m3-on-surface-variant hover:text-m3-error transition-standard shrink-0 mt-0.5"
                        title="Delete session"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>

                    <p className={`text-[11px] leading-snug line-clamp-1 mb-1.5 ${
                      isActive ? 'text-m3-on-primary-container/70' : 'text-m3-on-surface-variant'
                    }`}>
                      {session.preview}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] ${isActive ? 'text-m3-on-primary-container/60' : 'text-m3-on-surface-variant'}`}>
                        {session.messageCount} msg{session.messageCount !== 1 ? 's' : ''}
                      </span>
                      <span className={`text-[10px] ml-auto ${isActive ? 'text-m3-on-primary-container/60' : 'text-m3-on-surface-variant'}`}>
                        {formatSessionDate(session.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="border-t border-m3-outline-variant px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-m3-surface-container p-2.5">
              <span className="text-[10px] text-m3-on-surface-variant tracking-wide block mb-0.5">Memories</span>
              <span className="text-base font-display font-bold text-m3-on-surface">{agentStats?.total_memories ?? '—'}</span>
            </div>
            <div className="rounded-xl bg-m3-surface-container p-2.5">
              <span className="text-[10px] text-m3-on-surface-variant tracking-wide block mb-0.5">Sessions</span>
              <span className="text-base font-display font-bold text-m3-on-surface">{sessions.length}</span>
            </div>
          </div>
        </div>

        {/* Agent badge */}
        <div className="border-t border-m3-outline-variant px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-m3-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px] text-m3-on-primary-container">smart_toy</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-m3-on-surface tracking-wide truncate">
              {persona?.name || 'Agent'}
            </p>
            <p className="text-[10px] text-m3-on-surface-variant tracking-wide truncate">
              {persona?.role || 'Learning Assistant'}
            </p>
          </div>
          <Link href="/agent" className="ml-auto text-m3-on-surface-variant hover:text-m3-primary transition-standard shrink-0 rounded-lg p-1" title="Agent Memory">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
