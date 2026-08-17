import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { PathPoint } from '@/hooks/use-location-tracking';

import type { Coord } from '@/hooks/use-location-tracking';
import type { Boundary } from '@/types/boundary';

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

/**
 * What fraction of a boundary has been revealed, as a percentage.
 * Clips the visited area to the boundary first — walking outside the
 * city shouldn't inflate your city percentage.
 */
export function percentRevealed(
  visited: VisitedArea,
  boundary: Boundary | null
): number | null {
  if (!visited || !boundary || boundary.areaSqM <= 0) return null;

  try {
    const clipped = turf.intersect(
      turf.featureCollection([visited, boundary.geometry])
    );
    if (!clipped) return 0;

    return (turf.area(clipped) / boundary.areaSqM) * 100;
  } catch {
    return null;
  }
}

/**
 * Fold a finished session's corridor into the accumulated shape.
 * Called once per completed walk, not per GPS point — this is the
 * expensive operation, deliberately moved off the hot path.
 */
export function mergeVisitedArea(
  settled: VisitedArea,
  addition: VisitedArea
): VisitedArea {
  if (!addition) return settled;
  if (!settled) return addition;

  try {
    const combined: Feature<Polygon | MultiPolygon> | null = turf.union(
      turf.featureCollection([settled, addition])
    );
    if (!combined) return settled;

    // Keep the accumulated shape from growing unbounded in vertex count.
    const simplified = turf.simplify(combined, {
      tolerance: 0.00003,
      highQuality: false,
    });

    return simplified as Feature<Polygon | MultiPolygon>;
  } catch {
    return settled;
  }
}