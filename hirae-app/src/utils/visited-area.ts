import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { PathPoint } from '@/hooks/use-location-tracking';

import type { Coord } from '@/hooks/use-location-tracking';

export const REVEAL_RADIUS_M = 40;

export type VisitedArea = Feature<Polygon | MultiPolygon> | null;

export function buildVisitedArea(path: PathPoint[]): VisitedArea {
  if (path.length === 0) return null;

  const coords = path.map((p) => p.coord);

  if (coords.length === 1) {
    return turf.circle(coords[0], REVEAL_RADIUS_M, {
      steps: 64,
      units: 'meters',
    });
  }

  const line = turf.lineString(coords);

  // Drop points that don't meaningfully change the shape.
  const simplified = turf.simplify(line, {
    tolerance: 0.00005,
    highQuality: false,
  });

  const corridor = turf.buffer(simplified, REVEAL_RADIUS_M, {
    units: 'meters',
    steps: 16,
  }) as Feature<Polygon | MultiPolygon> | undefined;

  if (!corridor) return null;

  const smoothed = turf.polygonSmooth(corridor, { iterations: 2 });
  const first = smoothed.features[0];

  return (first as Feature<Polygon | MultiPolygon>) ?? corridor;
}

export function pathCentroid(path: PathPoint[]): Coord | null {
  if (path.length === 0) return null;
  const sum = path.reduce(
    (acc, p) => [acc[0] + p.coord[0], acc[1] + p.coord[1]],
    [0, 0]
  );
  return [sum[0] / path.length, sum[1] / path.length];
}