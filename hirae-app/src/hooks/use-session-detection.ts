import { useEffect, useRef, useState } from 'react';
import { distanceMeters, type PathPoint } from './use-location-tracking';

// --- Tuning constants (all guesses until real-world testing) ---

// Movement needed within the start window to begin a session.
const START_DISTANCE_M = 25;
const START_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

// How long without meaningful movement before a session ends.
const IDLE_TIMEOUT_MS = 4* 60 * 1000; // 4 minutes

// Movement below this between points counts as "not moving".
const IDLE_DISTANCE_M = 15;

// A finished session must clear both of these or it's discarded.
const MIN_SESSION_DISTANCE_M = 150;
const MIN_SESSION_DURATION_MS = 3 * 60 * 1000; // 3 minutes

// Above this speed the user isn't walking — the map still reveals,
// but these stretches don't count toward an adventure.
const WALKING_MAX_SPEED_MPS = 4.2; // ~15 km/h

const barrier = useRef<number>(0);

export type SessionState = 'idle' | 'active';

export type CompletedSession = {
    points: PathPoint[];
    startedAt: number;
    endedAt: number;
    distanceMeters: number;
    durationMs: number;
};

function walkingDistance(points: PathPoint[]): number {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        // Skip stretches travelled faster than walking pace.
        if (curr.speed != null && curr.speed > WALKING_MAX_SPEED_MPS) continue;
        total += distanceMeters(prev.coord, curr.coord);
    }
    return total;
}

export function useSessionDetection(path: PathPoint[]) {
    const [state, setState] = useState<SessionState>('idle');
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [lastCompleted, setLastCompleted] = useState<CompletedSession | null>(null);

    // Index in `path` where the current session began.
    const sessionStart = useRef<number>(0);
    // Last point at which real movement was observed.
    const lastMovement = useRef<PathPoint | null>(null);

    useEffect(() => {
        if (path.length === 0) return;

        const latest = path[path.length - 1];

        // ---------- IDLE: look for enough movement to start ----------
        if (state === 'idle') {
            const cutoff = Math.max(latest.timestamp - START_WINDOW_MS, barrier.current);
            const recent = path.filter((p) => p.timestamp >= cutoff);
            if (recent.length < 2) return;

            const moved = distanceMeters(recent[0].coord, latest.coord);
            if (moved >= START_DISTANCE_M) {
                sessionStart.current = path.indexOf(recent[0]);
                lastMovement.current = latest;
                setStartedAt(recent[0].timestamp);
                setState('active');
            }
            return;
        }

        // ---------- ACTIVE: watch for movement, or the idle timeout ----------
        const anchor = lastMovement.current;
        if (!anchor) {
            lastMovement.current = latest;
            return;
        }

        const movedSinceAnchor = distanceMeters(anchor.coord, latest.coord);

        if (movedSinceAnchor >= IDLE_DISTANCE_M) {
            lastMovement.current = latest;
            return;
        }

        const stillFor = latest.timestamp - anchor.timestamp;
        if (stillFor < IDLE_TIMEOUT_MS) return;

        // ---------- Session has ended ----------
        const points = path.slice(sessionStart.current);
        const distance = walkingDistance(points);
        const duration = anchor.timestamp - points[0].timestamp;

        const qualifies =
            distance >= MIN_SESSION_DISTANCE_M && duration >= MIN_SESSION_DURATION_MS;

        if (qualifies) {
            setLastCompleted({
                points,
                startedAt: points[0].timestamp,
                endedAt: anchor.timestamp,
                distanceMeters: distance,
                durationMs: duration,
            });
        }

        barrier.current = latest.timestamp;
        setState('idle');
        setStartedAt(null);
        lastMovement.current = null;
    }, [path, state]);

    const elapsedMs = startedAt ? Date.now() - startedAt : 0;

    return { state, startedAt, elapsedMs, lastCompleted };
}