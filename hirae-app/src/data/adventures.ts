import type { Adventure } from '@/types/adventure';

const MOCK_ADVENTURES: Adventure[] = [
  {
    id: '1',
    title: 'University of California',
    distanceMeters: 5100,
    startedAt: '2026-08-13T09:42:00Z',
    percentRevealed: 4,
    note: 'friends gave me a tour of their campus, was rly pretty',
    landmarkCount: 2,
  },
  {
    id: '2',
    title: 'dilly dally #2',
    distanceMeters: 1600,
    startedAt: '2026-08-10T15:20:00Z',
    percentRevealed: 1,
    note: null,
    landmarkCount: 0,
  },
  {
    id: '3',
    title: 'hike w/ mom',
    distanceMeters: 4100,
    startedAt: '2026-08-02T08:15:00Z',
    percentRevealed: 3,
    note: 'lowk terrible weather this day but the mountain was worth it',
    landmarkCount: 0,
  },
  {
    id: '4',
    title: 'Mission District',
    distanceMeters: 4300,
    startedAt: '2026-07-21T17:05:00Z',
    percentRevealed: 5,
    note: null,
    landmarkCount: 1,
  },
  {
    id: '5',
    title: 'Golden Gate Bridge',
    distanceMeters: 3500,
    startedAt: '2026-07-16T18:30:00Z',
    percentRevealed: 4,
    note: 'randomly took this walk after work bc the weather was nice',
    landmarkCount: 0,
  },
];

export async function getAdventures(): Promise<Adventure[]> {
  // For now: return mock data
  // Later: return supabase.from('adventures').select()...
  return MOCK_ADVENTURES;
}

export async function getAdventureById(id: string): Promise<Adventure | null> {
  return MOCK_ADVENTURES.find((a) => a.id === id) ?? null;
}

export async function updateAdventure(
  id: string,
  updates: { title?: string; note?: string | null }
): Promise<void> {
  const index = MOCK_ADVENTURES.findIndex((a) => a.id === id);
  if (index !== -1) {
    MOCK_ADVENTURES[index] = { ...MOCK_ADVENTURES[index], ...updates };
  }
}