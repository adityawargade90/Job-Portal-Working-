const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula. Returns the distance in kilometres.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Format a distance value (in km) into a human-readable string.
 * Distances under 1 km are shown in metres.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Build a Google Maps directions URL from an origin coordinate to a
 * destination query string (e.g. a city name or full address).
 */
export function getDirectionsUrl(
  originLat: number,
  originLng: number,
  destination: string
): string {
  const origin = `${originLat},${originLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}
