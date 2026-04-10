// src/utils/tokenStorage.ts
// Secure token storage using expo-secure-store
// NEVER use AsyncStorage for tokens

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Tokens } from '../types/auth.types';

const STORAGE_KEY = 'penakita_tokens';

export const TokenStorage = {
  get: async (): Promise<Tokens | null> => {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        raw = await SecureStore.getItemAsync(STORAGE_KEY);
      }
      if (!raw) return null;
      return JSON.parse(raw) as Tokens;
    } catch {
      if (Platform.OS === 'web') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      }
      return null;
    }
  },

  set: async (tokens: Tokens): Promise<void> => {
    const data = JSON.stringify(tokens);
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, data);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
    }
  },

  clear: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  },
};
