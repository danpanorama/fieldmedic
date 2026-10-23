import { ApiError } from '../../lib/api-client';

// One Hebrew message per error code. The server's English text is for logs, not for users.
const messages: Partial<Record<ApiError['code'], string>> = {
  MATCH_ALREADY_TAKEN: 'מישהו אחר הספיק לקחת את המשחק הזה. הרשימה עודכנה.',
  SCHEDULE_CLASH: 'המשחק מתנגש עם משחק אחר שלך.',
  LICENSE_INVALID: 'כדי לקחת משחקים צריך רישיון בתוקף.',
  MATCH_STARTED: 'המשחק כבר התחיל.',
  NETWORK: 'אין חיבור לשרת. בדקו את האינטרנט ונסו שוב.',
};

export function takeMatchErrorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : undefined;
  return (code && messages[code]) ?? 'משהו השתבש. נסו שוב בעוד רגע.';
}
