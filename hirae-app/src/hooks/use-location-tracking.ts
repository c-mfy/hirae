import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type Coord = [number, number]; // [longitude, latitude]

export type PathPoint = {
  coord: Coord;
  timestamp: number;
  speed: number | null; // metres per second
};

type Options = {
  mock?: boolean;
  initialPath?: PathPoint[];
};

// --- Mock route -------------------------------------------------------
// A serpentine sweep covering Georgia Tech and Midtown Atlanta.
// Rows are spaced slightly tighter than the reveal diameter so the
// corridors merge into solid coverage rather than parallel stripes.

const MOCK_BOUNDS = {
  south: 33.7700,
  north: 33.7900,
  west: -84.4020,
  east: -84.3750,
};

const ROW_SPACING_DEG = 0.00072; // ~80m — just under the reveal width
const STEP_DEG = 0.0027;         // ~250m between points along a row

function buildSweep(): Coord[] {
  const path: Coord[] = [];
  let eastward = true;

  for (let lat = MOCK_BOUNDS.south; lat <= MOCK_BOUNDS.north; lat += ROW_SPACING_DEG) {
    const lngs: number[] = [];
    for (let lng = MOCK_BOUNDS.west; lng <= MOCK_BOUNDS.east; lng += STEP_DEG) {
      lngs.push(lng);
    }
    if (!eastward) lngs.reverse();

    for (const lng of lngs) {
      path.push([Number(lng.toFixed(6)), Number(lat.toFixed(6))]);
    }
    eastward = !eastward;
  }

  return path;
}

const MOCK_PATH: Coord[] = buildSweep();

export const MOCK_CENTER: Coord = [-84.3885, 33.7800];

const MOCK_INTERVAL_MS = 300;

// Reject fixes we can't trust, in metres.
const MAX_ACCURACY_M = 25;

// Reject fixes implying a speed no ground travel could manage, in m/s.
// ~120 m/s is ~430 km/h — above high-speed rail, below aircraft cruise.
// This is a data-quality filter only. Deciding what counts as a *walk*
// happens in session detection, not here.
const MAX_SPEED_MPS = 120;

const WARMUP_FIXES = 3;

const MOCK_TIME_SCALE = 22;

export function distanceMeters(a: Coord, b: Coord): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useLocationTracking({ mock = false, initialPath }: Options = {}) {
  const [coords, setCoords] = useState<Coord | null>(null);
  const [path, setPath] = useState<PathPoint[]>(initialPath ?? []);
  const [error, setError] = useState<string | null>(null);

  const mockIndex = useRef(0);
  const fixCount = useRef(0);
  const lastAccepted = useRef<PathPoint | null>(null);

  useEffect(() => {
    // ---- Mock mode ----
    if (mock) {
      setError(null);
      mockIndex.current = 0;
      lastAccepted.current = null;

      const startWallClock = Date.now();

      const tick = () => {
        const index = mockIndex.current;
        mockIndex.current += 1;

        const WALK_STEPS = MOCK_PATH.length; // one full sweep
        const coord =
          index < WALK_STEPS
            ? MOCK_PATH[index]
            : MOCK_PATH[MOCK_PATH.length - 1]; // park at the end

        // Simulated clock, not the real one.
        const timestamp = startWallClock + index * MOCK_INTERVAL_MS * MOCK_TIME_SCALE;

        const prev = lastAccepted.current;
        const speed = prev
          ? distanceMeters(prev.coord, coord) / ((timestamp - prev.timestamp) / 1000)
          : 0;

        const point: PathPoint = { coord, timestamp, speed };
        lastAccepted.current = point;

        setCoords(coord);
        setPath((p) => [...p, point]);
      };

      tick();
      const timer = setInterval(tick, MOCK_INTERVAL_MS);

      return () => clearInterval(timer);
    }

    // ---- Real GPS ----
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    fixCount.current = 0;
    lastAccepted.current = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        setError('Turn on location services to see your position');
        return;
      }

      setError(null);

      const last = await Location.getLastKnownPositionAsync();
      if (last && !cancelled) {
        setCoords([last.coords.longitude, last.coords.latitude]);
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 3000,
        },
        (position) => {
          const coord: Coord = [position.coords.longitude, position.coords.latitude];
          const { accuracy } = position.coords;
          const timestamp = position.timestamp;

          fixCount.current += 1;

          if (fixCount.current <= WARMUP_FIXES) {
            setCoords(coord);
            return;
          }

          if (accuracy != null && accuracy > MAX_ACCURACY_M) return;

          const prev = lastAccepted.current;
          let speed = position.coords.speed;

          if (prev) {
            const metres = distanceMeters(prev.coord, coord);
            const seconds = (timestamp - prev.timestamp) / 1000;

            if (seconds > 0) {
              const derived = metres / seconds;
              if (derived > MAX_SPEED_MPS) return;
              // Android sometimes reports null or -1 for speed; fall back.
              if (speed == null || speed < 0) speed = derived;
            }
          }

          const point: PathPoint = { coord, timestamp, speed: speed ?? null };
          lastAccepted.current = point;

          setCoords(coord);
          setPath((p) => [...p, point]);
        }
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [mock]);

  const resetPath = () => setPath([]);

  return { coords, path, error, resetPath };
}