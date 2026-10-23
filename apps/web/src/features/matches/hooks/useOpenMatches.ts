import { useQuery } from '@tanstack/react-query';
import { fetchOpenMatches } from '../api';

/** Server state lives in TanStack Query: caching, loading/error states and refetching come for free. */
export function useOpenMatches(medicId: string) {
  return useQuery({
    queryKey: ['open-matches', medicId],
    queryFn: () => fetchOpenMatches(medicId),
  });
}
