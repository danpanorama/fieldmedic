import type { Assignment } from '../modules/assignments/assignment.repository';
import type { Match, Venue } from '../modules/matches/match.model';
import type { Medic } from '../modules/medics/medic.model';

// Fake but realistic data for the demo (Haifa district). Dates are relative to "now",
// so the demo always shows the coming weekend.

const venues: Venue[] = [
  {
    id: 'kiryat-eliezer-2',
    name: 'מגרש קריית אליעזר 2',
    city: 'חיפה',
    location: { lat: 32.8131, lng: 34.9776 },
  },
  { id: 'romema', name: 'מגרש רוממה', city: 'חיפה', location: { lat: 32.7915, lng: 34.9917 } },
  { id: 'nesher', name: 'מגרש נשר', city: 'נשר', location: { lat: 32.766, lng: 35.044 } },
  {
    id: 'neve-shaanan',
    name: 'אצטדיון נווה שאנן',
    city: 'חיפה',
    location: { lat: 32.783, lng: 35.018 },
  },
  { id: 'bat-galim', name: 'מגרש בת גלים', city: 'חיפה', location: { lat: 32.8325, lng: 34.9805 } },
  { id: 'afula', name: 'מגרש עפולה', city: 'עפולה', location: { lat: 32.608, lng: 35.29 } },
];

function nextSaturday(now: Date): Date {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() + ((6 - day.getDay() + 7) % 7 || 7));
  return day;
}

export function buildDemoData(now: Date) {
  const saturday = nextSaturday(now);
  const at = (dayOffset: number, hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(saturday);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h!, m!, 0, 0);
    return d;
  };
  const match = (
    id: string,
    dayOffset: number,
    from: string,
    to: string,
    ageGroup: string,
    venueId: string,
    payIls: number,
    league: string | null = null,
  ): Match => ({
    id,
    ageGroup,
    league,
    venueId,
    payIls,
    startsAt: at(dayOffset, from),
    endsAt: at(dayOffset, to),
  });

  const matches: Match[] = [
    match('m1', 0, '08:30', '09:45', "נערים א'", 'kiryat-eliezer-2', 300),
    match('m2', 0, '09:00', '10:45', "ילדים ב'", 'nesher', 200),
    match('m3', 0, '10:00', '11:45', "נערים ב'", 'romema', 350, 'ליגה ארצית'),
    match('m4', 0, '10:15', '11:30', "ילדים א'", 'kiryat-eliezer-2', 200),
    match('m5', 0, '12:00', '13:45', 'נוער', 'neve-shaanan', 400),
    match('m6', 1, '16:30', '18:00', 'נערות', 'bat-galim', 250),
    match('m7', 2, '16:00', '17:45', "ילדים ג'", 'bat-galim', 200),
    match('m8', 2, '18:00', '19:45', "נערים א'", 'afula', 300),
  ];

  const inOneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const medics: Medic[] = [
    {
      id: 'michal',
      firstName: 'מיכל',
      lastName: 'כהן',
      licenseNumber: 'MD-10234',
      licenseExpiresOn: inOneYear,
    },
    {
      id: 'ahmad',
      firstName: 'אחמד',
      lastName: 'חדאד',
      licenseNumber: 'MD-20871',
      licenseExpiresOn: inOneYear,
    },
    {
      id: 'yossi',
      firstName: 'יוסי',
      lastName: 'לוי',
      licenseNumber: 'MD-31502',
      licenseExpiresOn: lastMonth,
    },
  ];

  const assignments: Assignment[] = [
    { matchId: 'm1', medicId: 'michal' },
    { matchId: 'm8', medicId: 'michal' },
    { matchId: 'm4', medicId: 'ahmad' },
    { matchId: 'm5', medicId: 'ahmad' },
  ];

  return { venues, matches, medics, assignments };
}
