// app/post/[slug].tsx
// Post Detail Screen — article content viewer with likes and comments link

import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { usePost } from '../../src/hooks/usePost';
import { ParagraphRenderer } from '../../src/components/post/ParagraphRenderer';
import { AuthorCard } from '../../src/components/post/AuthorCard';

export default function PostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: post, isLoading, isError, handleLike } = usePost(slug);

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `${post.title}\n\nBaca artikel selengkapnya di Penakita.\nhttps://penakita.com/post/${post.slug}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCommentsPress = () => {
    if (post) {
      router.push(`/comments/${post.id}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white pt-16 px-5">
        {/* Back Button Skeleton */}
        <View className="w-10 h-10 bg-gray-200 rounded-full mb-8" style={{ marginTop: insets.top }} />

        {/* Title Skeleton */}
        <View className="w-full h-10 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-3/4 h-10 bg-gray-300 mb-8 rounded-sm" />

        {/* Author Info Skeleton */}
        <View className="flex-row items-center mb-10">
          <View className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
          <View>
            <View className="w-32 h-4 bg-gray-300 mb-2 rounded-sm" />
            <View className="w-24 h-4 bg-gray-200 rounded-sm" />
          </View>
        </View>

        {/* Paragraph Skeleton */}
        <View className="w-full h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-full h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-11/12 h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-full h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-4/5 h-4 bg-gray-300 mb-8 rounded-sm" />

        <View className="w-full h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-full h-4 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-11/12 h-4 bg-gray-300 mb-3 rounded-sm" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Ionicons name="alert-circle-outline" size={64} color="#fa5252" />
        <Text className="text-lg font-bold text-ink mt-4 text-center">
          Ups! Terjadi kesalahan
        </Text>
        <Text className="text-ink-tertiary mt-2 text-center">
          Gagal memuat artikel. Silakan coba kembali nanti.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-8 bg-surface-tertiary px-6 py-3 rounded-xl"
        >
          <Text className="text-ink font-semibold">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#212529" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pt-12">
          {/* Title */}
          <Text className="text-3xl font-bold text-ink leading-tight mb-4 font-serif">
            {post.title}
          </Text>

          {/* Author info */}
          <AuthorCard author={post.author} createdAt={post.publishedAt || post.createdAt} />
        </View>

        {/* Cover Image */}
        {post.coverImage && (
          <Image
            source={{ uri: post.coverImage }}
            className="w-full h-full bg-surface-tertiary my-6"
            contentFit="cover"
          />
        )}

        <View className="px-5">
          <View className="h-[1px] bg-surface-tertiary mb-6" />

          {/* Article Body */}
          {post.bodyModel.paragraphs.map((p, idx) => (
            <ParagraphRenderer key={p.id} paragraph={p} index={idx} />
          ))}

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-8">
              {post.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-surface-secondary px-3 py-1.5 rounded-full mr-2 mb-2 border border-surface-tertiary"
                >
                  <Text className="text-sm text-ink-secondary font-medium">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar Engagement Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-tertiary flex-row items-center justify-between px-6 pb-8 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="flex-row items-center">
          {/* Like */}
          <Pressable
            onPress={handleLike}
            className="flex-row items-center mr-6 active:opacity-60"
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.isLiked ? '#fa5252' : '#868e96'}
            />
            <Text className="text-sm font-medium text-ink-secondary ml-1.5">
              {post.likesCount}
            </Text>
          </Pressable>

          {/* Comments */}
          <Pressable
            onPress={handleCommentsPress}
            className="flex-row items-center active:opacity-60"
          >
            <Ionicons name="chatbubble-outline" size={22} color="#868e96" />
            <Text className="text-sm font-medium text-ink-secondary ml-1.5">
              {post.commentsCount}
            </Text>
          </Pressable>
        </View>

        {/* Action Right */}
        <View className="flex-row items-center">
          <Pressable onPress={handleShare} className="p-2 active:opacity-60">
            <Ionicons name="share-outline" size={24} color="#868e96" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
