const timeFormat = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('he-IL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "08:30" */
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** "יום שבת, 10 באוקטובר" */
export const formatDay = (iso: string) => dayFormat.format(new Date(iso));

/** Calendar-day key for grouping, in the user's local time zone. */
export const dayKey = (iso: string) => new Date(iso).toDateString();
