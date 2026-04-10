// src/types/settings.types.ts
// Settings-related types (Profile update, security, sessions)

export interface SettingsProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  fullName?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  clientType: 'mobile';
}


export interface Session {
  id: string;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrentSession: boolean;
}
