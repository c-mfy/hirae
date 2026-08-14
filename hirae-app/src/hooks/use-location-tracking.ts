import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export type Coord = [number, number]; // [longitude, latitude]

type Options = {
  mock?: boolean;
};

// A simple loop around a few blocks, used when mock mode is on.
const MOCK_PATH: Coord[] = [
  [-122.4194, 37.7749],
  [-122.4188, 37.7752],
  [-122.4180, 37.7756],
  [-122.4172, 37.7759],
  [-122.4166, 37.7756],
  [-122.4162, 37.7750],
  [-122.4168, 37.7745],
  [-122.4176, 37.7742],
  [-122.4185, 37.7744],
  [-122.4191, 37.7746],
];

const MOCK_INTERVAL_MS = 2000;

export function useLocationTracking({ mock = false }: Options = {}) {
  const [coords, setCoords] = useState<Coord | null>(null);
  const [path, setPath] = useState<Coord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mockIndex = useRef(0);

  useEffect(() => {
    // ---- Mock mode ----
    if (mock) {
      setError(null);
      mockIndex.current = 0;

      const tick = () => {
        const next = MOCK_PATH[mockIndex.current % MOCK_PATH.length];
        mockIndex.current += 1;
        setCoords(next);
        setPath((prev) => [...prev, next]);
      };

      tick(); // fire immediately so there's no initial delay
      const timer = setInterval(tick, MOCK_INTERVAL_MS);
      return () => clearInterval(timer);
    }

    // ---- Real GPS ----
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

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
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10, // metres moved before a new reading
          timeInterval: 3000,   // minimum ms between readings
        },
        (position) => {
          const next: Coord = [position.coords.longitude, position.coords.latitude];
          setCoords(next);
          setPath((prev) => [...prev, next]);
        }
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [mock]);

  return { coords, path, error };
}