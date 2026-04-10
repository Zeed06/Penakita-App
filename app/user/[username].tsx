// app/user/[username].tsx
// User profile screen — stats + infinite post feed

import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
const AnyFlashList = FlashList as any;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ProfileHeader } from '../../src/components/profile';
import { PostCard } from '../../src/components/feed/PostCard';
import { PostCardSkeletonList } from '../../src/components/feed/PostCardSkeleton';
import { useProfile } from '../../src/hooks/useProfile';
import { useAuthStore } from '../../src/stores/auth.store';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  
  const {
    profile,
    isLoadingProfile,
    profileError,
    posts,
    fetchNextPosts,
    hasNextPosts,
    isFetchingNextPosts,
    isLoadingPosts,
    handleToggleFollow,
    isFollowingLoading,
  } = useProfile(username);

  const isSelf = useMemo(() => {
    return currentUser?.username === username;
  }, [currentUser, username]);

  // --- Handlers ---
  const handleEndReached = () => {
    if (hasNextPosts && !isFetchingNextPosts) {
      fetchNextPosts();
    }
  };

  // --- Render Helpers ---
  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ title: 'Profil', headerTitleAlign: 'center' }} />
        <View className="px-5 py-8">
          <View className="flex-row items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-surface-secondary animate-pulse" />
            <View className="ml-5 flex-1 space-y-2">
              <View className="h-6 w-3/4 bg-surface-secondary rounded animate-pulse" />
              <View className="h-4 w-1/2 bg-surface-secondary rounded animate-pulse" />
            </View>
          </View>
          <PostCardSkeletonList count={3} />
        </View>
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Stack.Screen options={{ title: 'Profil' }} />
        <Ionicons name="person-outline" size={64} color="#dee2e6" />
        <Text className="text-xl font-bold text-ink mt-4">
          Pengguna tidak ditemukan
        </Text>
        <Text className="text-base text-ink-faint mt-2 text-center">
          Profil yang kamu cari mungkin telah dihapus atau nama pengguna salah.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{ 
          title: profile.fullName || 'Profil',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }} 
      />

      <AnyFlashList
        data={posts}
        renderItem={({ item }: { item: any }) => <PostCard post={item} />}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={250}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <ProfileHeader
            user={profile}
            isSelf={isSelf}
            onToggleFollow={handleToggleFollow}
            isFollowingLoading={isFollowingLoading}
          />
        }
        ListEmptyComponent={
          !isLoadingPosts ? (
            <View className="py-20 items-center">
              <Ionicons name="document-text-outline" size={48} color="#dee2e6" />
              <Text className="text-ink-faint mt-4">Belum ada artikel</Text>
            </View>
          ) : (
            <PostCardSkeletonList count={3} />
          )
        }
        ListFooterComponent={
          isFetchingNextPosts ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#4c6ef5" />
            </View>
          ) : (
            <View style={{ height: insets.bottom + 20 }} />
          )
        }
      />
    </View>
  );
}
