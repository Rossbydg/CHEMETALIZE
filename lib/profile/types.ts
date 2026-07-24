export interface PlatformStat {
  platform: string;
  handle: string;
  followers: number;
  engagementRate: number;
}

export interface Audience {
  age?: string;
  geo?: string;
  gender?: string;
}

export interface ProfileInput {
  niche: string;
  bio: string;
  platforms: PlatformStat[];
  audience: Audience;
  tone: string;
  pastDeals: string;
  rateFloor: number | null;
}
