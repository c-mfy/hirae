import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PathPoint } from '@/hooks/use-location-tracking';
import type { VisitedArea } from '@/utils/visited-area';

const AREA_KEY = 'hirae:visited-area';
const PATH_KEY = 'hirae:active-path';

// --- Settled area (everything from finished sessions) ---

export async function loadVisitedArea(): Promise<VisitedArea> {
  try {
    const raw = await AsyncStorage.getItem(AREA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveVisitedArea(area: VisitedArea): Promise<void> {
  try {
    if (area) await AsyncStorage.setItem(AREA_KEY, JSON.stringify(area));
  } catch {
    // best effort
  }
}

// --- Active path (current, unmerged session) ---
// Kept so an in-progress walk survives the app being killed.

export async function loadPath(): Promise<PathPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(PATH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePath(path: PathPoint[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PATH_KEY, JSON.stringify(path));
  } catch {
    // best effort
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([AREA_KEY, PATH_KEY]);
  } catch {
    // best effort
  }
}