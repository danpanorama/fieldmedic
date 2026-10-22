export interface GeoPoint {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;
/** Roads are longer than a straight line. */
const ROAD_FACTOR = 1.3;
const AVG_SPEED_KMH = 40;
const PARKING_MINUTES = 5;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line distance between two points (haversine formula). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Rough driving time for the demo. A maps API replaces this later,
 * which is why callers depend on a `TravelMinutes` function, not on this one directly.
 */
export function estimateTravelMinutes(from: GeoPoint, to: GeoPoint): number {
  const km = distanceKm(from, to);
  if (km < 0.1) return 0;
  return Math.ceil(((km * ROAD_FACTOR) / AVG_SPEED_KMH) * 60) + PARKING_MINUTES;
}
