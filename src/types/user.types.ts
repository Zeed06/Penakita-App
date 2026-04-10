// src/types/user.types.ts
// User profile types for Penakita

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserProfile extends User {
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isSelf?: boolean;
}

export interface UserSearchResponse {
  items: UserProfile[];
  nextCursor: string | null;
}
