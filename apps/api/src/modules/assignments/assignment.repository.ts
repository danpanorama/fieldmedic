export interface Assignment {
  matchId: string;
  medicId: string;
}

export interface AssignmentRepository {
  listAll(): Promise<Assignment[]>;
}
