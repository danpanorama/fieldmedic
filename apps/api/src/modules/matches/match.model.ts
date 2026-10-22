import type { GeoPoint } from '@fieldmedic/shared';

export interface Venue {
  id: string;
  name: string;
  city: string;
  location: GeoPoint;
}

export interface Match {
  id: string;
  ageGroup: string;
  league: string | null;
  startsAt: Date;
  endsAt: Date;
  venueId: string;
  payIls: number;
}
