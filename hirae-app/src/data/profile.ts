import type { Profile } from '@/types/profile';

const MOCK_PROFILE: Profile = {
  name: 'Xin',
  location: 'San Francisco, California',
  joinedAt: '2026-06-01T00:00:00Z',
  adventureCount: 8,
  landmarkCount: 12,
  cityPercent: 32,
  friends: [
    { id: '1', name: 'John' },
    { id: '2', name: 'Jane' },
    { id: '3', name: 'Annie' },
    { id: '4', name: 'Kath' },
    { id: '5', name: 'Marcus' },
    { id: '6', name: 'Priya' },
    { id: '7', name: 'Theo' },
    { id: '8', name: 'Nina' },
  ],
};

export async function getProfile(): Promise<Profile> {
  return MOCK_PROFILE;
}