// src/components/feed/PostCard.tsx
// Post card for feed lists — uses expo-image, NativeWind styling

import { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import type { Post } from '../../types/post.types';
import { formatDate } from '../../utils/date';
import { useAuthStore } from '../../stores/auth.store';
import { useDeletePost } from '../../hooks/useEditor';

const AnimatedImage = Animated.createAnimatedComponent(Image) as React.ComponentType<
  AnimatedProps<ImageProps> & { sharedTransitionTag?: string }
>;

interface PostCardProps {
  post: Post;
}

function getPreviewText(post: Post): string {
  if (post.excerpt) return post.excerpt;

  const firstParagraph = post.bodyModel?.paragraphs?.find(
    (p) => p.type === 'P' && p.text,
  );
  const text = firstParagraph?.text ?? '';
  if (text.length <= 120) return text;
  return `${text.slice(0, 120)}...`;
}

function getPreviewImage(post: Post): string | null {
  if (post.coverImage) return post.coverImage;

  const firstImage = post.bodyModel?.paragraphs?.find(
    (p) => p.type === 'IMG' && p.metadata?.src,
  );
  return firstImage?.metadata?.src ?? null;
}

function PostCardComponent({ post }: PostCardProps) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const deleteMutation = useDeletePost();

  const isAuthor = currentUser?.username && post.author?.username && currentUser.username === post.author.username;

  const handlePress = useCallback(() => {
    router.push(`/post/${post.slug}`);
  }, [router, post.slug]);

  const handleAuthorPress = useCallback(() => {
    if (post.author?.username) {
      router.push(`/user/${post.author.username}`);
    }
  }, [router, post.author?.username]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Hapus Artikel?',
      'Artikel ini akan dihapus secara permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(post.id);
              Toast.show({ type: 'success', text1: 'Artikel dihapus' });
            } catch {
              Toast.show({ type: 'error', text1: 'Gagal menghapus artikel' });
            }
          }
        }
      ]
    );
  }, [deleteMutation, post.id]);

  const preview = getPreviewText(post);
  const previewImage = getPreviewImage(post);

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white px-5 py-5 border-b border-[#f2f2f2] active:bg-[#fafafa]"
    >
      {/* Author Row */}
      <Pressable
        onPress={handleAuthorPress}
        className="flex-row items-center mb-2.5"
        hitSlop={4}
      >
        {post.author?.avatarUrl ? (
          <Image
            source={{ uri: post.author.avatarUrl }}
            className="w-5 h-5 rounded-full bg-[#f2f2f2]"
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="w-5 h-5 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-[10px] font-bold text-primary-600">
              {post.author?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text className="text-[12px] text-[#242424] ml-2 font-medium">
          {post.author?.fullName || post.author?.username || 'Unknown Author'}
        </Text>
      </Pressable>

      {/* Content Row */}
      <View className="flex-row mb-3 mt-1 items-center">
        {/* Text Content */}
        <View className="flex-1 pr-4 justify-center">
          <Text
            className="text-base font-bold text-[#242424] leading-6 mb-1 font-serif"
            numberOfLines={2}
          >
            {post.title}
          </Text>
          {preview.length > 0 && (
            <Text
              className="text-[13px] text-[#6B6B6B] leading-5 font-serif"
              numberOfLines={2}
            >
              {preview}
            </Text>
          )}
        </View>

        {/* Cover Image */}
        {previewImage && (
          <AnimatedImage
            source={{ uri: previewImage }}
            className="w-[110px] h-[80px] bg-[#f2f2f2]"
            contentFit="cover"
            transition={200}
            sharedTransitionTag={`image-${post.id}`}
          />
        )}
      </View>

      {/* Footer — Likes & Comments */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-[13px] text-[#6B6B6B] mr-4">
            {formatDate(post.publishedAt ?? post.createdAt)}
          </Text>
          <View className="flex-row items-center mr-4">
            <Ionicons
              name="thumbs-up-outline"
              size={18}
              color="#6B6B6B"
            />
            <Text className="text-[13px] text-[#6B6B6B] ml-1.5">
              {post.likesCount}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={17} color="#6B6B6B" />
            <Text className="text-[13px] text-[#6B6B6B] ml-1.5">
              {post.commentsCount}
            </Text>
          </View>
        </View>

        {isAuthor && (
          <Pressable onPress={handleDelete} hitSlop={10} className="flex-row items-center">
            <Ionicons name="trash-outline" size={18} color="#dc3545" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export const PostCard = memo(PostCardComponent);
