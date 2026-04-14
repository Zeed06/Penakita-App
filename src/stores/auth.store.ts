// src/stores/auth.store.ts
// Zustand store for client auth state

import { create } from 'zustand';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { User, Tokens } from '../types/auth.types';
import { TokenStorage } from '../utils/tokenStorage';
import { queryClient } from '../providers/QueryProvider';

// Configure Google Sign-in globally
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthActions {
  /** Set the current user after login / profile fetch */
  setUser: (user: User) => void;

  /** Clear auth state and tokens — called on logout or forced logout */
  logout: () => Promise<void>;

  /**
   * Initialize auth on app startup.
   * Checks SecureStore for existing tokens to determine initial state.
   * Does NOT fetch /auth/me — that is handled by a TanStack Query hook.
   */
  initialize: () => Promise<void>;

  /** Store tokens after login/register/refresh */
  setTokens: (tokens: Tokens) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // --- State ---
  user: null,
  isLoggedIn: false,
  isLoading: true,

  // --- Actions ---
  setUser: (user: User) => {
    set({ user, isLoggedIn: true });
  },

  logout: async () => {
    try {
      // 1. Clear Google Sign-In session if active
      // Direct call to signOut is robust across library versions as we are in a try-catch
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }

    // 2. Clear TanStack Query cache to prevent stale data leaking
    queryClient.clear();

    // 3. Clear tokens and local state
    await TokenStorage.clear().catch(() => {});
    set({ user: null, isLoggedIn: false, isLoading: false });
  },

  initialize: async () => {
    try {
      const tokens = await TokenStorage.get();
      if (tokens?.accessToken) {
        // Tokens exist — mark as logged in.
        // The actual user profile will be fetched by a TanStack Query
        // hook (useCurrentUser) once the app navigates.
        set({ isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoggedIn: false, isLoading: false });
      }
    } catch {
      // SecureStore read failed — treat as logged out
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  setTokens: async (tokens: Tokens) => {
    await TokenStorage.set(tokens);
    set({ isLoggedIn: true });
  },
}));
