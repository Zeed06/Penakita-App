// src/services/user.service.ts
// User API calls — profile, follow, search, posts

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type { UserProfile, UserSearchResponse } from '../types/user.types';
import type { FeedResponse } from '../types/post.types';

interface PaginationParams {
  limit?: number;
  cursor?: string;
}

interface SearchParams extends PaginationParams {
  q: string;
}

interface FollowResponse {
  isFollowing: boolean;
}

export const userService = {
  getProfile: async (username: string): Promise<UserProfile> => {
    // BACKEND BELUM SUPPORT
    return {
      id: 'mock',
      username,
      fullName: username,
      avatarUrl: null,
      bio: null,
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString()
    };
  },

  toggleFollow: async (username: string): Promise<FollowResponse> => {
    // BACKEND BELUM SUPPORT
    return { isFollowing: false };
  },

  searchUsers: async ({
    q,
    limit = 10,
    cursor,
  }: SearchParams): Promise<UserSearchResponse> => {
    // BACKEND BELUM SUPPORT
    return { items: [], nextCursor: null };
  },

  getUserPosts: async (
    username: string,
    params: PaginationParams = {},
  ): Promise<FeedResponse> => {
    // BACKEND BELUM SUPPORT
    return { items: [], nextCursor: null };
  },
};
