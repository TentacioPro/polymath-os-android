import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Persona } from '@/lib/types';

export function useMemories(limit = 100) {
  return useQuery({
    queryKey: ['memories', limit],
    queryFn: () => api.getMemories(limit).then((r) => r.data),
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMemory(id),

    // ── Optimistic: instantly remove memory from list ──────────────────
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['memories'] });
      const previous = qc.getQueryData(['memories']);
      qc.setQueryData(['memories'], (old: any[] | undefined) =>
        old ? old.filter((m) => m.id !== id) : old,
      );
      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['memories'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['memories'] });
      qc.invalidateQueries({ queryKey: ['agentStats'] });
    },
  });
}

export function useLearnFromData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.learnFromData(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memories'] });
      qc.invalidateQueries({ queryKey: ['agentStats'] });
      qc.invalidateQueries({ queryKey: ['learningLogs'] });
    },
  });
}

export function useConsolidateMemories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.consolidateMemories(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['memories'] });
      qc.invalidateQueries({ queryKey: ['agentStats'] });
    },
  });
}

export function usePersona() {
  return useQuery({
    queryKey: ['persona'],
    queryFn: () => api.getPersona().then((r) => r.data),
  });
}

export function useUpdatePersona() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Persona>) => api.updatePersona(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['persona'] });
    },
  });
}

export function useLearningLogs(limit = 50) {
  return useQuery({
    queryKey: ['learningLogs', limit],
    queryFn: () => api.getLearningLogs(limit).then((r) => r.data),
  });
}

export function useChatWithAgent() {
  return useMutation({
    mutationFn: (message: string) =>
      api.chatWithAgent(message).then((r) => r.data),
  });
}

export function useAgentStats() {
  return useQuery({
    queryKey: ['agentStats'],
    queryFn: () => api.getAgentStats().then((r) => r.data),
  });
}
