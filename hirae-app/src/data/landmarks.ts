import type { Landmark } from '@/types/landmark';

const MOCK_LANDMARKS: Landmark[] = [
  { id: '1', name: 'Mission District Center', distanceMeters: 1100, discovered: true },
  { id: '2', name: 'Dolores Park Overlook', distanceMeters: 60, discovered: true },
  { id: '3', name: 'Undiscovered Landmark', distanceMeters: 3400, discovered: false },
  { id: '4', name: 'Undiscovered Landmark', distanceMeters: 5200, discovered: false },
];

export async function getNearbyLandmarks(): Promise<Landmark[]> {
  return [...MOCK_LANDMARKS].sort((a, b) => a.distanceMeters - b.distanceMeters);
}