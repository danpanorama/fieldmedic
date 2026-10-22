import { describe, expect, it } from 'vitest';
import { distanceKm, estimateTravelMinutes } from './travel';

const haifaRomema = { lat: 32.7915, lng: 34.9917 };
const kiryatEliezer = { lat: 32.8131, lng: 34.9776 };
const telAviv = { lat: 32.0853, lng: 34.7818 };

describe('distanceKm', () => {
  it('is zero for the same point', () => {
    expect(distanceKm(haifaRomema, haifaRomema)).toBe(0);
  });

  it('matches the known Haifa → Tel Aviv distance (~81 km)', () => {
    expect(distanceKm(haifaRomema, telAviv)).toBeGreaterThan(78);
    expect(distanceKm(haifaRomema, telAviv)).toBeLessThan(84);
  });
});

describe('estimateTravelMinutes', () => {
  it('needs no travel within the same venue', () => {
    expect(estimateTravelMinutes(haifaRomema, haifaRomema)).toBe(0);
  });

  it('gives a short drive inside one city', () => {
    const minutes = estimateTravelMinutes(kiryatEliezer, haifaRomema);
    expect(minutes).toBeGreaterThanOrEqual(8);
    expect(minutes).toBeLessThanOrEqual(15);
  });

  it('gives a long drive between cities', () => {
    expect(estimateTravelMinutes(haifaRomema, telAviv)).toBeGreaterThan(120);
  });
});
