export type Friend = {
  id: string;
  name: string;
};

export type Profile = {
  name: string;
  location: string;
  joinedAt: string;
  adventureCount: number;
  landmarkCount: number;
  cityPercent: number;
  friends: Friend[];
};