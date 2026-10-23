// API contracts: the exact JSON shapes the API returns and the web app reads.
// Both sides import these types, so a change on one side breaks the build on the other
// instead of breaking in production. Dates travel as ISO strings.

export interface VenueDto {
  id: string;
  name: string;
  city: string;
}

export interface MatchSummaryDto {
  id: string;
  startsAt: string;
  endsAt: string;
  venue: VenueDto;
}

export type FitDto =
  | { kind: 'free' }
  | {
      kind: 'clash';
      reason: 'overlap' | 'travel';
      travelMinutes: number;
      other: MatchSummaryDto;
    }
  | {
      kind: 'back-to-back';
      position: 'before' | 'after';
      travelMinutes: number;
      other: MatchSummaryDto;
    };

export interface OpenMatchDto extends MatchSummaryDto {
  ageGroup: string;
  league: string | null;
  payIls: number;
  fit: FitDto;
}

export interface OpenMatchesResponse {
  medic: { id: string; firstName: string; licenseValid: boolean };
  myMatchCount: number;
  matches: OpenMatchDto[];
}
