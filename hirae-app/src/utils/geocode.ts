import type { Coord } from '@/hooks/use-location-tracking';

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

/**
 * Turn a coordinate into a short place name for an adventure title.
 * Falls back to a generic label if the lookup fails — a failed network
 * call should never block saving a session.
 */
export async function reverseGeocode(coord: Coord): Promise<string> {
  const [lng, lat] = coord;

  try {
    const url =
      `https://api.mapbox.com/search/geocode/v6/reverse` +
      `?longitude=${lng}&latitude=${lat}` +
      `&types=neighborhood,place,locality` +
      `&limit=1&access_token=${TOKEN}`;

    const res = await fetch(url);
    if (!res.ok) return 'Untitled walk';

    const json = await res.json();
    const name = json?.features?.[0]?.properties?.name;

    return typeof name === 'string' && name.length > 0 ? name : 'Untitled walk';
  } catch {
    return 'Untitled walk';
  }
}