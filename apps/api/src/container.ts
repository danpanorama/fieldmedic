import { createDemoStore } from './demo/demo-store';
import { createMatchService, type MatchService } from './modules/matches/match.service';

export interface Container {
  matchService: MatchService;
}

/**
 * Composition root: the one place that decides which implementation backs each interface.
 * Swapping demo data for Postgres or the real feed happens here and nowhere else.
 */
export function createContainer(): Container {
  const store = createDemoStore();
  return {
    matchService: createMatchService({ ...store, now: () => new Date() }),
  };
}
