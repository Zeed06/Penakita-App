// src/types/auth.types.ts
// Core auth types for Penakita

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  provider: 'email' | 'google';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  clientType: 'mobile';
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  clientType: 'mobile';
}

export interface GoogleAuthRequest {
  idToken: string;
  clientType: 'mobile';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  isNewUser?: boolean;
  linked?: boolean;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
