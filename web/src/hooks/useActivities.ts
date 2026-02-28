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
      api.createActivity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
