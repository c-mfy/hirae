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

const MOCK_PATH: Coord[] = [
  [-82.0564, 33.5292],
  [-82.0557, 33.5295],
  [-82.0549, 33.5298],
  [-82.0541, 33.5300],
  [-82.0535, 33.5297],
  [-82.0531, 33.5291],
  [-82.0537, 33.5286],
  [-82.0545, 33.5283],
  [-82.0554, 33.5285],
  [-82.0561, 33.5288],
];

const MOCK_INTERVAL_MS = 2000;

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

        const WALK_STEPS = MOCK_PATH.length * 2; // two laps ≈ 15 simulated minutes
        const coord =
          index < WALK_STEPS
            ? MOCK_PATH[index % MOCK_PATH.length]
            : MOCK_PATH[MOCK_PATH.length - 1];

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

export const MOCK_CENTER: Coord = [-82.0547, 33.5291];