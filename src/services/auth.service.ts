// src/services/auth.service.ts
// Auth API calls — all requests go through the service layer

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthResponse,
} from '../types/auth.types';

interface RegisterResponse {
  message: string;
  email: string;
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser?: boolean;
  linked?: boolean;
}

interface ResendVerificationRequest {
  email: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (
    data: Omit<RegisterRequest, 'clientType'>,
  ): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, {
      ...data,
      clientType: 'mobile',
    });
    return response.data;
  },

  googleAuth: async (idToken: string): Promise<GoogleAuthResponse> => {
    const payload: GoogleAuthRequest = {
      idToken,
      clientType: 'mobile',
    };
    const response = await api.post<GoogleAuthResponse>(
      ENDPOINTS.AUTH.GOOGLE_TOKEN,
      payload,
    );
    return response.data;
  },

  resendVerification: async (email: string): Promise<void> => {
    const payload: ResendVerificationRequest = { email };
    await api.post(ENDPOINTS.AUTH.RESEND_VERIFICATION, payload);
  },


  logout: async (refreshToken: string): Promise<void> => {
    await api.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },
};
