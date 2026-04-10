// src/stores/auth.store.ts
// Zustand store for client auth state

import { create } from 'zustand';
import type { User, Tokens } from '../types/auth.types';
import { TokenStorage } from '../utils/tokenStorage';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthActions {
  /** Set the current user after login / profile fetch */
  setUser: (user: User) => void;

  /** Clear auth state and tokens — called on logout or forced logout */
  logout: () => void;

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

  logout: () => {
    // Clear tokens asynchronously — fire and forget
    TokenStorage.clear().catch(() => {});
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
  },
}));
