import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useActivities(limit = 100) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: () => api.getActivities(limit).then((r) => r.data),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; url?: string; notes?: string }) =>
      api.createActivity(data).then((r) => r.data),

    // ── Optimistic: instantly prepend a temp item ──────────────────────
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['activities'] });
      const previous = qc.getQueryData(['activities']);
      const tempItem = {
        id: `__temp__${Date.now()}`,
        title: data.title,
        source: 'manual',
        url: data.url ?? null,
        notes: data.notes ?? null,
        timestamp: new Date().toISOString(),
        __optimistic: true,
      };
      qc.setQueryData(['activities'], (old: any[] | undefined) =>
        old ? [tempItem, ...old] : [tempItem],
      );
      return { previous, tempItem };
    },

    // ── On success: replace temp with real data ────────────────────────
    onSuccess: (realItem, _variables, context) => {
      qc.setQueryData(['activities'], (old: any[] | undefined) =>
        old ? old.map((a) => (a.id === context?.tempItem?.id ? realItem : a)) : old,
      );
      qc.invalidateQueries({ queryKey: ['stats'] });
    },

    // ── On error: rollback ─────────────────────────────────────────────
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['activities'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUploadActivities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.uploadActivities(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteActivity(id),

    // ── Optimistic: instantly remove ───────────────────────────────────
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['activities'] });
      const previous = qc.getQueryData(['activities']);
      qc.setQueryData(['activities'], (old: any[] | undefined) =>
        old ? old.filter((a) => a.id !== id) : old,
      );
      return { previous };
    },

    // ── On error: rollback ─────────────────────────────────────────────
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(['activities'], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
