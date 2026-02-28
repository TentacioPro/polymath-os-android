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
      api.createJournal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJournal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
