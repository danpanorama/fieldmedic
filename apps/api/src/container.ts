import { createDemoStore } from './demo/demo-store';
import {
  createAssignmentService,
  type AssignmentService,
} from './modules/assignments/assignment.service';
import { createMatchService, type MatchService } from './modules/matches/match.service';

export interface Container {
  matchService: MatchService;
  assignmentService: AssignmentService;
}

/**
 * Composition root: the one place that decides which implementation backs each interface.
 * Swapping demo data for Postgres or the real feed happens here and nowhere else.
 */
export function createContainer(): Container {
  const deps = { ...createDemoStore(), now: () => new Date() };
  return {
    matchService: createMatchService(deps),
    assignmentService: createAssignmentService(deps),
  };
}
