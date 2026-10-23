import { useQuery } from '@tanstack/react-query';
import { fetchOpenMatches } from '../api';

export const openMatchesKey = (medicId: string) => ['open-matches', medicId] as const;

/** Server state lives in TanStack Query: caching, loading/error states and refetching come for free. */
export function useOpenMatches(medicId: string) {
  return useQuery({
    queryKey: openMatchesKey(medicId),
    queryFn: () => fetchOpenMatches(medicId),
  });
}
