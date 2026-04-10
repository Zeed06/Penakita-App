// src/services/settings.service.ts
// Service for profile settings, password, and active sessions

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type {
  SettingsProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  Session,
} from '../types/settings.types';
import type { Tokens } from '../types/auth.types';

export const settingsService = {
  getProfile: async (): Promise<SettingsProfile> => {
    const response = await api.get<{ data: SettingsProfile }>(
      ENDPOINTS.SETTINGS.PROFILE,
    );
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<SettingsProfile> => {
    const response = await api.put<{ data: SettingsProfile }>(
      ENDPOINTS.SETTINGS.PROFILE,
      data,
    );
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<Tokens> => {
    // API returns new tokens to invalidate other sessions but keep current alive
    const response = await api.put<Tokens>(ENDPOINTS.SETTINGS.PASSWORD, data);
    return response.data;
  },

  /**
   * Update user avatar by uploading to Cloudinary and then sending URL to backend
   * @param uri Local file URI from image picker, or null to remove avatar
   */
  updateAvatar: async (uri: string | null): Promise<SettingsProfile> => {
    let avatarUrl: string | null = null;

    if (uri) {
      // 1. Upload to Cloudinary first
      const { uploadToCloudinary } = await import('../utils/cloudinary');
      avatarUrl = await uploadToCloudinary(uri);
    }

    // 2. Send the URL (or null) to Penakita backend as JSON
    const response = await api.put<{ data: SettingsProfile }>(
      ENDPOINTS.SETTINGS.AVATAR,
      { avatarUrl }
    );
    return response.data.data;
  },

  getSessions: async (): Promise<Session[]> => {
    const response = await api.get<{ data: Session[] }>(ENDPOINTS.AUTH.SESSIONS);
    return response.data.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(ENDPOINTS.AUTH.REVOKE_SESSION(sessionId));
  },

  logoutAll: async (): Promise<void> => {
    await api.post(ENDPOINTS.AUTH.LOGOUT_ALL);
  },
};
