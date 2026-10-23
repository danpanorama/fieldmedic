export interface Assignment {
  matchId: string;
  medicId: string;
}

export type ClaimResult = 'claimed' | 'already-taken';

export interface AssignmentRepository {
  listAll(): Promise<Assignment[]>;
  /**
   * Assigns the match to the medic only if nobody holds it yet.
   * Must be atomic: when two claims for the same match race, exactly one returns 'claimed'.
   */
  claim(assignment: Assignment): Promise<ClaimResult>;
}
