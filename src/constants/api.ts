// src/constants/api.ts
// API base URL and endpoint constants for Penakita

export const BASE_URL = 'https://penakita-api.ibrohimsairony.workers.dev';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    GOOGLE_TOKEN: '/auth/google/token',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: (id: string) => `/auth/sessions/${id}` as const,
    LOGOUT_ALL: '/auth/logout-all',
  },

  // Posts
  POSTS: {
    FEED: '/api/posts',
    FOLLOWING_FEED: '/api/posts/following',
    // SEARCH: '/api/posts/search', // Belum ada di backend
    DETAIL: (slug: string) => `/api/posts/${slug}` as const,
    LIKE: (id: string) => `/api/posts/${id}/like` as const,
    CREATE: '/api/posts',
    UPDATE: (id: string) => `/api/posts/${id}` as const,
    DELETE: (id: string) => `/api/posts/${id}` as const,
    PUBLISH: (id: string) => `/api/posts/${id}/publish` as const,
    MY_DRAFTS: '/api/posts/drafts',
  },

  // Comments
  COMMENTS: {
    LIST: (postId: string) => `/api/posts/${postId}/comments` as const,
    CREATE: (postId: string) => `/api/posts/${postId}/comments` as const,
    UPDATE: (id: string) => `/api/comments/${id}` as const,
    DELETE: (id: string) => `/api/comments/${id}` as const,
    REPORT: (id: string) => `/api/comments/${id}/report` as const,
  },

  // Users
  USERS: {
    PROFILE: (username: string) => `/api/users/${username}` as const,
    FOLLOW: (username: string) => `/api/users/${username}/follow` as const,
    POSTS: (username: string) => `/api/posts/user/${username}` as const,
    SEARCH: '/api/users/search',
  },

  // Settings
  SETTINGS: {
    PROFILE: '/api/settings/profile',
    PASSWORD: '/api/settings/password',
    AVATAR: '/api/settings/avatar',
  },

  // Tags
  TAGS: {
    LIST: '/api/tags',
  },
} as const;

