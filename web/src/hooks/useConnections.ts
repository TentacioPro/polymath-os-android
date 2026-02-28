import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: () => api.getConnections().then((r) => r.data),
  });
}

export function useGenerateConnections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => api.generateConnections(activityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: ['suggestions'],
    queryFn: () => api.getSuggestions().then((r) => r.data),
    enabled: false, // manually triggered
  });
}
