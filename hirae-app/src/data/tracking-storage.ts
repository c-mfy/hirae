import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PathPoint } from '@/hooks/use-location-tracking';

const PATH_KEY = 'hirae:visited-path';

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
    // Storage failures shouldn't crash tracking — worst case we lose
    // progress on this launch rather than breaking the session.
  }
}

export async function clearPath(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PATH_KEY);
  } catch {
    // ignore
  }
}