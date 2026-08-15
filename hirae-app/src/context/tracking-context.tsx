import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocationTracking, type Coord, type PathPoint } from '@/hooks/use-location-tracking';
import { useSessionDetection, type SessionState } from '@/hooks/use-session-detection';
import { buildVisitedArea, pathCentroid, type VisitedArea } from '@/utils/visited-area';
import { reverseGeocode } from '@/utils/geocode';
import { createAdventure } from '@/data/adventures';
import { loadPath, savePath, clearPath } from '@/data/tracking-storage';

type TrackingValue = {
  coords: Coord | null;
  path: PathPoint[];
  error: string | null;
  visitedArea: VisitedArea;
  sessionState: SessionState;
  startedAt: number | null;
  latestTimestamp: number | undefined;
  savedNotice: string | null;
  mockMode: boolean;
  setMockMode: (on: boolean) => void;
  hydrated: boolean;
  resetTracking: () => void;
};

const TrackingContext = createContext<TrackingValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [initialPath, setInitialPath] = useState<PathPoint[]>([]);

  useEffect(() => {
    loadPath().then((saved) => {
      if (__DEV__) console.log('[hirae] restored points:', saved.length);
      setInitialPath(saved);
      setHydrated(true);
    });
  }, []);

  // Don't mount the tracker until the saved path is available —
  // useState only reads its initial value once, so the inner
  // component must not exist before then.
  if (!hydrated) return null;

  return <TrackingProviderInner initialPath={initialPath}>{children}</TrackingProviderInner>;
}

function TrackingProviderInner({
  initialPath,
  children,
}: {
  initialPath: PathPoint[];
  children: ReactNode;
}) {
  const [mockMode, setMockMode] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const { coords, path, error, resetPath } = useLocationTracking({
    mock: mockMode,
    initialPath,
  });

  const { state: sessionState, startedAt, lastCompleted } = useSessionDetection(path);

  const visitedArea = useMemo(() => buildVisitedArea(path), [path]);
  const latestTimestamp = path.length ? path[path.length - 1].timestamp : undefined;

  const savedRef = useRef<number | null>(null);

  // Persist the path, debounced so we're not writing on every fix.
  useEffect(() => {
    if (path.length === 0) return;
    const timer = setTimeout(() => {
      if (__DEV__) console.log('[hirae] saving points:', path.length);
      savePath(path);
    }, 2000);
    return () => clearTimeout(timer);
  }, [path]);

  useEffect(() => {
    if (!lastCompleted) return;
    if (savedRef.current === lastCompleted.startedAt) return;
    savedRef.current = lastCompleted.startedAt;

    (async () => {
      const centroid = pathCentroid(lastCompleted.points);
      const title = centroid ? await reverseGeocode(centroid) : 'Untitled walk';
      await createAdventure(lastCompleted, title);
      setSavedNotice(`Saved "${title}"`);
      setTimeout(() => setSavedNotice(null), 4000);
    })();
  }, [lastCompleted]);

  const resetTracking = () => {
    resetPath();
    clearPath();
    savedRef.current = null;
    setSavedNotice('Cleared');
    setTimeout(() => setSavedNotice(null), 2000);
  };

  const value: TrackingValue = {
    coords,
    path,
    error,
    visitedArea,
    sessionState,
    startedAt,
    latestTimestamp,
    savedNotice,
    mockMode,
    setMockMode,
    hydrated: true,
    resetTracking,
  };

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used inside TrackingProvider');
  return ctx;
}