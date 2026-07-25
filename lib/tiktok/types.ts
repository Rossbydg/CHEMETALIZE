export interface TikTokUserInfo {
  openId: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
}

export interface TikTokTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
