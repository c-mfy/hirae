import type { Feature, Polygon, MultiPolygon } from 'geojson';

export type Scope = 'city' | 'state' | 'country' | 'world';

export type Boundary = {
  scope: Scope;
  name: string;          // "Martinez", "Georgia", "United States"
  geometry: Feature<Polygon | MultiPolygon>;
  areaSqM: number;       // cached so we don't recompute every render
  fetchedAt: number;
};