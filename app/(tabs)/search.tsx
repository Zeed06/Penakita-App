// app/(tabs)/search.tsx
// Search screen — focus on articles search only

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
const AnyFlashList = FlashList as any;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PostCard } from '../../src/components/feed/PostCard';
import { PostCardSkeletonList } from '../../src/components/feed/PostCardSkeleton';
import { useSearch } from '../../src/hooks/useSearch';
import type { Post } from '../../src/types/post.types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  
  // Articles Search
  const articleSearch = useSearch();
  
  const flatPosts = useMemo<Post[]>(() => {
    return (articleSearch.data?.pages.flatMap((page) => page.items) as Post[]) ?? [];
  }, [articleSearch.data?.pages]);

  // --- Handlers ---
  const handleEndReached = useCallback(() => {
    if (articleSearch.hasNextPage && !articleSearch.isFetchingNextPage) {
      articleSearch.fetchNextPage();
    }
  }, [articleSearch]);

  const renderArticle = useCallback(
    ({ item }: { item: Post }) => <PostCard post={item} />,
    []
  );

  // --- Empty / Idle States ---
  const ListEmpty = useCallback(() => {
    if (articleSearch.isLoading) return null;

    if (!articleSearch.debouncedQuery) {
      return (
        <View className="flex-1 items-center justify-center py-24 px-8">
          <Ionicons name="search-outline" size={48} color="#dee2e6" />
          <Text className="text-base text-ink-faint mt-4 text-center">
            Ketik untuk mencari artikel...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-24 px-8">
        <Ionicons 
          name="document-text-outline" 
          size={48} 
          color="#dee2e6" 
        />
        <Text className="text-base text-ink-secondary mt-4 text-center">
          Tidak ada hasil untuk "{articleSearch.debouncedQuery}"
        </Text>
        <Text className="text-sm text-ink-faint mt-2 text-center">
          Coba kata kunci lain
        </Text>
      </View>
    );
  }, [articleSearch.isLoading, articleSearch.debouncedQuery]);

  const ListFooter = useCallback(() => {
    if (!articleSearch.isFetchingNextPage) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#4c6ef5" />
      </View>
    );
  }, [articleSearch.isFetchingNextPage]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Search Bar */}
      <View className="px-5 pt-3 pb-2">
        <View className="flex-row items-center bg-surface-secondary rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={18} color="#868e96" />
          <TextInput
            className="flex-1 text-base text-ink ml-2.5"
            placeholder="Cari artikel..."
            placeholderTextColor="#adb5bd"
            value={articleSearch.query}
            onChangeText={articleSearch.setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {articleSearch.query.length > 0 && (
            <Pressable onPress={() => articleSearch.setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#adb5bd" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tabs Placeholder / Label */}
      <View className="flex-row border-b border-border-faint px-5">
        <View className="py-3 mr-6 border-b-2 border-indigo-600">
          <Text className="font-semibold text-indigo-600">
            Artikel
          </Text>
        </View>
      </View>

      {/* Results */}
      {articleSearch.isLoading && articleSearch.debouncedQuery ? (
        <PostCardSkeletonList count={5} />
      ) : (
      <AnyFlashList
        data={flatPosts}
        renderItem={renderArticle}
        keyExtractor={(item: any) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        estimatedItemSize={200}
      />
      )}
    </View>
  );
}
