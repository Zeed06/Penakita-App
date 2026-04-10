// src/services/api.ts
// Axios instance with auth interceptors (attach token + auto-refresh on 401)

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { BASE_URL, ENDPOINTS } from '../constants/api';
import { FORCE_LOGOUT_CODES } from '../constants/errorCodes';
import { TokenStorage } from '../utils/tokenStorage';
import { useAuthStore } from '../stores/auth.store';

// --- Axios instance ---
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Refresh queue types ---
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

// --- Extended config to track retries ---
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ============================================================
// REQUEST INTERCEPTOR — attach Bearer token from SecureStore
// ============================================================
api.interceptors.request.use(async (config) => {
  const tokens = await TokenStorage.get();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// ============================================================
// RESPONSE INTERCEPTOR — handle 401 + auto refresh
// ============================================================
api.interceptors.response.use(
  // Success — pass through
  (response) => response,

  // Error handler
  async (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const original = error.config as RetryConfig | undefined;
    if (!original) return Promise.reject(error);

    const errorCode = error.response?.data?.error?.code;

    // ── 1. Force logout for security violations — NO retry ──
    if (errorCode && FORCE_LOGOUT_CODES.has(errorCode)) {
      await TokenStorage.clear();
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // ── 2. 401 handling with refresh queue ──
    const isUnauthorized = error.response?.status === 401;
    const isRefreshEndpoint = original.url === ENDPOINTS.AUTH.REFRESH;

    if (isUnauthorized && !original._retry && !isRefreshEndpoint) {
      // If another refresh is already in flight, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      // Mark this request as retried and start refresh
      original._retry = true;
      isRefreshing = true;

      try {
        const tokens = await TokenStorage.get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await api.post<{
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          tokenType: string;
        }>(ENDPOINTS.AUTH.REFRESH, {
          refreshToken: tokens.refreshToken,
        });

        // Store new tokens
        await TokenStorage.set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          tokenType: data.tokenType,
        });

        // Process all queued requests with the new token
        processQueue(null, data.accessToken);

        // Retry the original request
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        // Refresh failed — logout and reject all queued requests
        processQueue(refreshError, null);
        await TokenStorage.clear();
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 3. All other errors — pass through ──
    return Promise.reject(error);
  },
);
