import type { Match, Venue } from './match.model';

/**
 * Where matches come from. Today: demo data. Later: the Football Association feed.
 * The rest of the system depends only on this interface (adapter pattern),
 * so switching the source touches one file.
 */
export interface MatchSource {
  listMatches(range: { from: Date; to: Date }): Promise<Match[]>;
  findById(id: string): Promise<Match | null>;
  listVenues(): Promise<Venue[]>;
}
