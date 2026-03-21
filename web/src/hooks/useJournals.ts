import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Journal } from '@/lib/types';

export function useJournals(limit = 100) {
  return useQuery({
    queryKey: ['journals', limit],
    queryFn: () => api.getJournals(limit).then((r) => r.data),
  });
}

export function useCreateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; tags?: string[] }) =>
      api.createJournal(data).then((r) => r.data),

    // ── Optimistic: instantly prepend a temp entry ─────────────────────
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['journals'] });
      const previous = qc.getQueryData(['journals']);
      const tempEntry: Partial<Journal> & { __optimistic: boolean } = {
        id: `__temp__${Date.now()}`,
        title: data.title,
        content: data.content,
        tags: data.tags ?? [],
        timestamp: new Date().toISOString(),
        __optimistic: true,
      };
      qc.setQueryData(['journals'], (old: any[] | undefined) =>
        old ? [tempEntry, ...old] : [tempEntry],
      );
      return { previous, tempEntry };
    },

    // ── On success: replace temp with real entry ───────────────────────
    onSuccess: (realEntry, _variables, context) => {
      qc.setQueryData(['journals'], (old: any[] | undefined) =>
        old ? old.map((j) => (j.id === context?.tempEntry?.id ? realEntry : j)) : old,
      );
      qc.invalidateQueries({ queryKey: ['stats'] });
    },

    // ── On error: rollback ─────────────────────────────────────────────
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['journals'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}

export function useUpdateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; content: string; tags?: string[] } }) =>
      api.updateJournal(id, data).then((r) => r.data),

    // ── Optimistic: instantly apply update ────────────────────────────
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['journals'] });
      const previous = qc.getQueryData(['journals']);
      qc.setQueryData(['journals'], (old: any[] | undefined) =>
        old ? old.map((j) => (j.id === id ? { ...j, ...data, __optimistic: true } : j)) : old,
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['journals'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJournal(id),

    // ── Optimistic: instantly remove ───────────────────────────────────
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['journals'] });
      const previous = qc.getQueryData(['journals']);
      qc.setQueryData(['journals'], (old: any[] | undefined) =>
        old ? old.filter((j) => j.id !== id) : old,
      );
      return { previous };
    },

    // ── On error: rollback ─────────────────────────────────────────────
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['journals'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['journals'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
