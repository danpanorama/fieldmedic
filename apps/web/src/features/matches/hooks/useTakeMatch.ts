import { useMutation, useQueryClient } from '@tanstack/react-query';
import { takeMatch } from '../api';
import { openMatchesKey } from './useOpenMatches';

export function useTakeMatch(medicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => takeMatch(medicId, matchId),
    // Win or lose, the list may be stale (someone else may have taken it), so refetch.
    onSettled: () => queryClient.invalidateQueries({ queryKey: openMatchesKey(medicId) }),
  });
}
