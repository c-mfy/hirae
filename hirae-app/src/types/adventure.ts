export type Adventure = {
  id: string;
  title: string;
  distanceMeters: number;
  durationMinutes: number;
  startedAt: string;      // ISO timestamp
  percentRevealed: number;
  note: string | null;
  landmarkCount: number;
};