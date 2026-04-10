// app/(tabs)/index.tsx
// Home Feed screen — "Untukmu" and "Following" tabs with FlashList

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { PostCard } from '../../src/components/feed/PostCard';
import { PostCardSkeletonList } from '../../src/components/feed/PostCardSkeleton';
import { useFeed } from '../../src/hooks/useFeed';
import { useFollowingFeed } from '../../src/hooks/useFollowingFeed';
import { useAuthStore } from '../../src/stores/auth.store';
import type { Post } from '../../src/types/post.types';

type FeedTab = 'forYou' | 'following';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');

  // Hooks for both feeds
  const forYouFeed = useFeed();
  const followingFeed = useFollowingFeed();

  // Select active feed based on tab
  const activeFeed = activeTab === 'forYou' ? forYouFeed : followingFeed;

  // Flatten all pages into a single array
  const flatItems = useMemo(() => {
    return activeFeed.data?.pages.flatMap((page) => page.items) ?? [];
  }, [activeFeed.data?.pages]);

  const handleRefresh = useCallback(() => {
    activeFeed.refetch();
  }, [activeFeed]);

  const handleEndReached = useCallback(() => {
    if (activeFeed.hasNextPage && !activeFeed.isFetchingNextPage) {
      activeFeed.fetchNextPage();
    }
  }, [activeFeed]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  // ── List Empty Component ──
  const ListEmpty = useCallback(() => {
    if (activeFeed.isLoading) return null;

    // Following tab when not logged in
    if (activeTab === 'following' && !isLoggedIn) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <Ionicons name="people-outline" size={48} color="#adb5bd" />
          <Text className="text-lg font-semibold text-ink mt-4 text-center">
            Ikuti penulis favoritmu
          </Text>
          <Text className="text-sm text-ink-tertiary mt-2 text-center">
            Login untuk melihat artikel dari penulis yang kamu ikuti
          </Text>
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-600 rounded-xl px-6 py-3 mt-6 active:bg-primary-700"
          >
            <Text className="text-white font-semibold text-sm">Masuk</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20 px-8">
        <Ionicons name="document-text-outline" size={48} color="#adb5bd" />
        <Text className="text-lg font-semibold text-ink mt-4">
          Belum ada artikel
        </Text>
        <Text className="text-sm text-ink-tertiary mt-2 text-center">
          {activeTab === 'following'
            ? 'Penulis yang kamu ikuti belum menulis artikel baru'
            : 'Artikel akan muncul di sini'}
        </Text>
      </View>
    );
  }, [activeFeed.isLoading, activeTab, isLoggedIn, router]);

  // ── List Footer ──
  const ListFooter = useCallback(() => {
    if (!activeFeed.isFetchingNextPage) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#4c6ef5" />
      </View>
    );
  }, [activeFeed.isFetchingNextPage]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Text className="text-[30px] font-extrabold text-[#242424] tracking-tight py-1" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>Penakita</Text>
        <View className="flex-row items-center space-x-6">
          <Ionicons name="notifications-outline" size={26} color="#6B6B6B" />
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row px-5 border-b border-[#f2f2f2]">
        <Pressable
          onPress={() => setActiveTab('forYou')}
          className={`py-3 mr-6 ${activeTab === 'forYou'
              ? 'border-b border-[#242424]'
              : ''
            }`}
        >
          <Text
            className={`text-[15px] ${activeTab === 'forYou' ? 'text-[#242424] font-medium' : 'text-[#6B6B6B]'
              }`}
          >
            Untukmu
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('following')}
          className={`py-3 ${activeTab === 'following'
              ? 'border-b border-[#242424]'
              : ''
            }`}
        >
          <Text
            className={`text-[15px] ${activeTab === 'following' ? 'text-[#242424] font-medium' : 'text-[#6B6B6B]'
              }`}
          >
            Following
          </Text>
        </Pressable>
      </View>

      {/* Feed Content */}
      {activeFeed.isLoading ? (
        <PostCardSkeletonList count={5} />
      ) : (
        <FlashList
          data={flatItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          refreshControl={
            <RefreshControl
              refreshing={activeFeed.isRefetching && !activeFeed.isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor="#4c6ef5"
              colors={['#4c6ef5']}
            />
          }
        />
      )}

      {/* Floating Action Button for Drafting */}
      <Pressable
        onPress={() => {
          if (isLoggedIn) {
            router.push('/editor');
          } else {
            router.push('/(auth)/login');
          }
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg active:bg-primary-700"
        style={{ elevation: 5 }}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </Pressable>
    </View>
  );
}
