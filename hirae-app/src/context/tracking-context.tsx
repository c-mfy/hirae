import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocationTracking, type Coord, type PathPoint } from '@/hooks/use-location-tracking';
import { useSessionDetection, type SessionState } from '@/hooks/use-session-detection';
import {
  buildVisitedArea,
  mergeVisitedArea,
  pathCentroid,
  percentRevealed,
  type VisitedArea,
} from '@/utils/visited-area';
import { reverseGeocode } from '@/utils/geocode';
import { createAdventure } from '@/data/adventures';
import { loadPath, savePath, loadVisitedArea, saveVisitedArea, clearAll } from '@/data/tracking-storage';
import { getBoundary } from '@/data/boundaries';
import type { Boundary, Scope } from '@/types/boundary';

type TrackingValue = {
  coords: Coord | null;
  path: PathPoint[];
  error: string | null;
  settledArea: VisitedArea;
  liveArea: VisitedArea;
  sessionState: SessionState;
  startedAt: number | null;
  latestTimestamp: number | undefined;
  savedNotice: string | null;
  mockMode: boolean;
  setMockMode: (on: boolean) => void;
  hydrated: boolean;
  resetTracking: () => void;
  scope: Scope;
  setScope: (s: Scope) => void;
  boundary: Boundary | null;
  percent: number | null;
};

const TrackingContext = createContext<TrackingValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [initialPath, setInitialPath] = useState<PathPoint[]>([]);
  const [initialArea, setInitialArea] = useState<VisitedArea>(null);

  useEffect(() => {
    Promise.all([loadPath(), loadVisitedArea()]).then(([savedPath, savedArea]) => {
      if (__DEV__) {
        console.log('[hirae] restored path points:', savedPath.length,
          '| settled area:', savedArea ? 'yes' : 'none');
      }
      setInitialPath(savedPath);
      setInitialArea(savedArea);
      setHydrated(true);
    });
  }, []);

  if (!hydrated) return null;

  return (
    <TrackingProviderInner initialPath={initialPath} initialArea={initialArea}>
      {children}
    </TrackingProviderInner>
  );
}

function TrackingProviderInner({
  initialPath,
  initialArea,
  children,
}: {
  initialPath: PathPoint[];
  initialArea: VisitedArea;
  children: ReactNode;
}) {
  const [mockMode, setMockMode] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>('city');
  const [boundary, setBoundary] = useState<Boundary | null>(null);

  // Everything from finished sessions. Static — never recomputed.
  const [settledArea, setSettledArea] = useState<VisitedArea>(initialArea);

  const { coords, path, error, resetPath } = useLocationTracking({
    mock: mockMode,
    initialPath,
  });

  const { state: sessionState, startedAt, lastCompleted } = useSessionDetection(path);

  // Only the current, unmerged path. Short, so rebuilding is cheap.
  const liveArea = useMemo(() => buildVisitedArea(path), [path]);

  const latestTimestamp = path.length ? path[path.length - 1].timestamp : undefined;
  const savedRef = useRef<number | null>(null);

  // Persist the active path so an in-progress walk survives a crash.
  useEffect(() => {
    if (path.length === 0) return;
    const timer = setTimeout(() => savePath(path), 2000);
    return () => clearTimeout(timer);
  }, [path]);

  // On session end: save the adventure, then fold the corridor into
  // the settled shape and drop the raw points.
  useEffect(() => {
    if (!lastCompleted) return;
    if (savedRef.current === lastCompleted.startedAt) return;
    savedRef.current = lastCompleted.startedAt;

    (async () => {
      const centroid = pathCentroid(lastCompleted.points);
      const title = centroid ? await reverseGeocode(centroid) : 'Untitled walk';
      await createAdventure(lastCompleted, title);

      const sessionArea = buildVisitedArea(lastCompleted.points);
      const merged = mergeVisitedArea(settledArea, sessionArea);
      setSettledArea(merged);
      await saveVisitedArea(merged);

      resetPath();
      await savePath([]);

      setSavedNotice(`Saved "${title}"`);
      setTimeout(() => setSavedNotice(null), 4000);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCompleted]);

  const roundedKey = coords ? `${coords[1].toFixed(2)},${coords[0].toFixed(2)}` : null;

  useEffect(() => {
    if (scope === 'world') {
      setBoundary(null);
      return;
    }
    if (!coords) return;

    let cancelled = false;
    getBoundary(coords, scope).then((b) => {
      if (!cancelled) setBoundary(b);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundedKey, scope]);

  // Percentage counts settled plus live, so it moves during a walk.
  const totalArea = useMemo(
    () => mergeVisitedArea(settledArea, liveArea),
    [settledArea, liveArea]
  );

  const percent = useMemo(
    () => percentRevealed(totalArea, boundary),
    [totalArea, boundary]
  );

  const resetTracking = () => {
    resetPath();
    setSettledArea(null);
    clearAll();
    savedRef.current = null;
    setSavedNotice('Cleared');
    setTimeout(() => setSavedNotice(null), 2000);
  };

  const value: TrackingValue = {
    coords,
    path,
    error,
    settledArea,
    liveArea,
    sessionState,
    startedAt,
    latestTimestamp,
    savedNotice,
    mockMode,
    setMockMode,
    hydrated: true,
    resetTracking,
    scope,
    setScope,
    boundary,
    percent,
  };

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error('useTracking must be used inside TrackingProvider');
  return ctx;
}