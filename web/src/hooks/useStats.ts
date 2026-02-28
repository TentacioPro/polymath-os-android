import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats().then((r) => r.data),
  });
}
