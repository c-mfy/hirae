import AsyncStorage from '@react-native-async-storage/async-storage';
import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { Coord } from '@/hooks/use-location-tracking';
import type { Boundary, Scope } from '@/types/boundary';

const CACHE_PREFIX = 'hirae:boundary:v2';

// Nominatim requires a real User-Agent identifying the application,
// and allows at most one request per second. We only ever fetch a
// boundary once per place, so this stays well inside the policy.
const USER_AGENT = 'Hirae/1.0 (personal exploration app)';

// Which OSM admin level to ask for, per scope.
const ADDRESS_KEY: Record<Exclude<Scope, 'world'>, string[]> = {
  city: ['city', 'town', 'village', 'municipality', 'suburb'],
  state: ['state', 'province', 'region'],
  country: ['country'],
};

type NominatimResult = {
  display_name?: string;
  name?: string;
  address?: Record<string, string>;
  geojson?: Polygon | MultiPolygon;
};

async function requestBoundary(
  coord: Coord,
  scope: Exclude<Scope, 'world'>
): Promise<Boundary | null> {
  const [lng, lat] = coord;

  // zoom controls how coarse a place Nominatim resolves to:
  // 10 = city/town, 5 = state, 3 = country.
  const zoom = scope === 'city' ? 10 : scope === 'state' ? 5 : 3;

  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${lat}&lon=${lng}` +
    `&zoom=${zoom}&format=jsonv2&polygon_geojson=1`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;

    const json = (await res.json()) as NominatimResult;
    if (!json.geojson) return null;

    const geometry = turf.feature(json.geojson) as Feature<Polygon | MultiPolygon>;

    // Pull a short name out of the address block rather than using
    // display_name, which is a long comma-separated string.
    const keys = ADDRESS_KEY[scope];
    const name =
      keys.map((k) => json.address?.[k]).find(Boolean) ??
      json.name ??
      json.display_name?.split(',')[0] ??
      'Unknown';

    return {
      scope,
      name,
      geometry,
      areaSqM: turf.area(geometry),
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Get the boundary containing this coordinate at the given scope.
 * Cached indefinitely — administrative boundaries effectively never move.
 */
export async function getBoundary(
  coord: Coord,
  scope: Exclude<Scope, 'world'>
): Promise<Boundary | null> {
  // Round the cache key so nearby positions share one entry.
  const key = `${CACHE_PREFIX}${scope}:${coord[1].toFixed(2)},${coord[0].toFixed(2)}`;

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return JSON.parse(cached) as Boundary;
  } catch {
    // fall through and refetch
  }

  const fresh = await requestBoundary(coord, scope);
  if (!fresh) return null;

  try {
    await AsyncStorage.setItem(key, JSON.stringify(fresh));
  } catch {
    // caching is best-effort
  }

  return fresh;
}