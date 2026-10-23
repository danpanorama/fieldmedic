import { describe, expect, it } from 'vitest';
import { ApiError } from '../../lib/api-client';
import { takeMatchErrorMessage } from './take-match-messages';

describe('takeMatchErrorMessage', () => {
  it('explains that someone else was faster', () => {
    const error = new ApiError(409, 'MATCH_ALREADY_TAKEN', 'Someone already took this match');
    expect(takeMatchErrorMessage(error)).toContain('מישהו אחר הספיק');
  });

  it('explains a schedule clash', () => {
    expect(takeMatchErrorMessage(new ApiError(409, 'SCHEDULE_CLASH', ''))).toContain('מתנגש');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(takeMatchErrorMessage(new Error('boom'))).toBe('משהו השתבש. נסו שוב בעוד רגע.');
    expect(takeMatchErrorMessage(new ApiError(500, 'INTERNAL', ''))).toBe(
      'משהו השתבש. נסו שוב בעוד רגע.',
    );
  });
});
