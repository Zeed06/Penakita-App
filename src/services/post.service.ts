// src/services/post.service.ts
// Post API calls — feed, following, search, detail, like

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type { FeedResponse, Post, BodyModel } from '../types/post.types';

interface CreateDraftData {
  title: string;
  bodyModel: BodyModel;
  coverImage?: string | null;
}

interface UpdatePostData {
  title?: string;
  bodyModel?: BodyModel;
  coverImage?: string | null;
}

interface PaginationParams {
  limit?: number;
  cursor?: string;
}

interface SearchParams extends PaginationParams {
  q: string;
}

interface LikeResponse {
  liked: boolean;
}

export const postService = {
  getFeed: async ({
    limit = 10,
    cursor,
  }: PaginationParams = {}): Promise<FeedResponse> => {
    const params: Record<string, string | number> = { limit };
    if (cursor) params.cursor = cursor;

    const response = await api.get<FeedResponse>(ENDPOINTS.POSTS.FEED, {
      params,
    });
    console.log('[getFeed] Raw response items[0] author:', JSON.stringify(response.data.items[0]?.author, null, 2));
    return response.data;
  },

  getFollowingFeed: async ({
    limit = 10,
    cursor,
  }: PaginationParams = {}): Promise<FeedResponse> => {
    // BACKEND BELUM SUPPORT: Endpoint /api/posts/following belum diimplementasikan di backend
    // Mengembalikan data kosong agar layar tab tetap bisa dirender
    return { items: [], nextCursor: null };
  },

  searchPosts: async ({
    q,
    limit = 10,
    cursor,
  }: SearchParams): Promise<FeedResponse> => {
    // BACKEND BELUM SUPPORT: Endpoint /api/posts/search belum diimplementasikan di backend
    // Mengembalikan data kosong agar layar tab tetap bisa dirender
    return { items: [], nextCursor: null };
  },

  getPostBySlug: async (slug: string): Promise<Post> => {
    const response = await api.get<{ data: Post }>(
      ENDPOINTS.POSTS.DETAIL(slug),
    );
    return response.data.data;
  },

  toggleLike: async (postId: string): Promise<LikeResponse> => {
    const response = await api.post<{ data: LikeResponse }>(
      ENDPOINTS.POSTS.LIKE(postId),
    );
    return response.data.data;
  },

  createDraft: async (data: CreateDraftData): Promise<{ id: string; slug: string; status: 'draft' | 'published' }> => {
    const response = await api.post<{ data: { id: string; slug: string; status: 'draft' | 'published' } }>(
      ENDPOINTS.POSTS.CREATE,
      data,
    );
    return response.data.data;
  },

  updatePost: async (id: string, data: UpdatePostData): Promise<Post> => {
    const response = await api.put<{ data: Post }>(
      ENDPOINTS.POSTS.UPDATE(id),
      data,
    );
    return response.data.data;
  },

  publishPost: async (id: string, tags: string[]): Promise<Post> => {
    const response = await api.post<{ data: Post }>(
      ENDPOINTS.POSTS.PUBLISH(id),
      { tags },
    );
    return response.data.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.POSTS.DELETE(id));
  },
};
