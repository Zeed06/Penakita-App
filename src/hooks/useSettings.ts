// src/hooks/useSettings.ts
// Hooks for managing user settings, profiles, and sessions

import { useQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';
import { useAuthStore } from '../stores/auth.store';
import type { Post, FeedResponse } from '../types/post.types';
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/settings.types';

export function useSettingsProfile() {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => settingsService.getProfile(),
  });
}

// --- Helper: Sync user data across multiple query caches ---
function syncUserCache(queryClient: any, updatedProfile: any) {
  // 1. Cross-Cache Synchronization: Update all articles in all feeds where I am the author
  // This will match ['posts', 'feed'], ['posts', 'bookmarks'], etc.
  queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
    if (!old) return old;

    // Handle InfiniteQuery structure (Feed)
    if (old.pages) {
      const infiniteOld = old as InfiniteData<FeedResponse>;
      return {
        ...infiniteOld,
        pages: infiniteOld.pages.map(page => ({
          ...page,
          items: page.items.map(item => 
            item.author.id === updatedProfile.id 
            ? { 
                ...item, 
                author: { 
                  ...item.author, 
                  username: updatedProfile.username ?? item.author.username, 
                  fullName: updatedProfile.fullName ?? item.author.fullName,
                  avatarUrl: updatedProfile.avatarUrl !== undefined ? updatedProfile.avatarUrl : item.author.avatarUrl
                } 
              } 
            : item
          )
        }))
      };
    }

    // Handle single Post structure
    const singleOld = old as Post;
    if (singleOld.author && singleOld.author.id === updatedProfile.id) {
      return {
        ...singleOld,
        author: {
          ...singleOld.author,
          username: updatedProfile.username ?? singleOld.author.username,
          fullName: updatedProfile.fullName ?? singleOld.author.fullName,
          avatarUrl: updatedProfile.avatarUrl !== undefined ? updatedProfile.avatarUrl : singleOld.author.avatarUrl
        }
      };
    }

    return old;
  });

  // Also invalidate specific user profile key to be safe
  queryClient.invalidateQueries({ queryKey: ['user', updatedProfile.username] });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => settingsService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      const currentUser = useAuthStore.getState().user;
      
      // If username changed, invalidate the old username query to prevent stale data
      if (currentUser && currentUser.username !== updatedProfile.username) {
        queryClient.invalidateQueries({ queryKey: ['user', currentUser.username] });
      }

      // Merge logic: If backend returns null avatar but we have one, keep it.
      const mergedProfile = {
        ...updatedProfile,
        avatarUrl: updatedProfile.avatarUrl || currentUser?.avatarUrl || null
      };

      // Update specific queries that rely on the user profile
      queryClient.setQueryData(['settings', 'profile'], mergedProfile);
      
      // 1. Sync cache across posts
      syncUserCache(queryClient, mergedProfile);

      // 2. Update global auth store user
      setUser({
        id: mergedProfile.id,
        username: mergedProfile.username,
        email: mergedProfile.email,
        fullName: mergedProfile.fullName,
        bio: mergedProfile.bio ?? null,
        avatarUrl: mergedProfile.avatarUrl,
        provider: currentUser?.provider || 'email',
        emailVerified: mergedProfile.isEmailVerified,
        createdAt: mergedProfile.createdAt,
        updatedAt: new Date().toISOString(),
      });
    },
  });
}

export function useChangePassword() {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsService.changePassword(data),
    onSuccess: async (newTokens) => {
      // Secure the new tokens since passwords reset invalidates old ones across devices
      await setTokens(newTokens);
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (uri: string | null) => settingsService.updateAvatar(uri),
    onSuccess: (updatedProfile) => {
      // 1. Update the profile cache with merge
      queryClient.setQueryData(['settings', 'profile'], (old: any) => ({
        ...old,
        ...updatedProfile,
      }));
      
      // 2. Sync cache across posts
      syncUserCache(queryClient, updatedProfile);
      
      queryClient.invalidateQueries({ queryKey: ['user', updatedProfile.username] });
      
      if (currentUser) {
        setUser({
          ...currentUser,
          ...updatedProfile,
        });
      }
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: () => settingsService.getSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => settingsService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] });
    },
  });
}

export function useLogoutAll() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => settingsService.logoutAll(),
    onSuccess: () => {
      // The logout store action will clear the secure store and send the user to login.
      logout();
    },
  });
}
