// app/post/[slug].tsx
// Post Detail Screen — article content viewer with animations ala Medium

import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  FadeIn,
  FadeInDown,
  interpolate,
  Extrapolation,
  AnimatedProps,
} from 'react-native-reanimated';

import { usePost } from '../../src/hooks/usePost';
import { ParagraphRenderer } from '../../src/components/post/ParagraphRenderer';
import { AuthorCard } from '../../src/components/post/AuthorCard';

const HEADER_IMAGE_HEIGHT = 280;
const AnimatedImage = Animated.createAnimatedComponent(Image) as React.ComponentType<
  AnimatedProps<ImageProps> & { sharedTransitionTag?: string }
>;

export default function PostDetailScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: post, isLoading, isError, handleLike } = usePost(slug);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const contentHeight = useSharedValue(1);
  const progressWidth = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, contentHeight.value - SCREEN_HEIGHT + insets.bottom],
      [0, 100],
      Extrapolation.CLAMP
    );
    return {
      width: `${progress}%`,
    };
  });

  const headerImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-HEADER_IMAGE_HEIGHT, 0],
      [2, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

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

  if (isLoading) {
    return (
      <View className="flex-1 bg-white pt-16 px-5">
        <View className="w-10 h-10 bg-gray-200 rounded-full mb-8" style={{ marginTop: insets.top }} />
        <View className="w-full h-10 bg-gray-300 mb-3 rounded-sm" />
        <View className="w-3/4 h-10 bg-gray-300 mb-8 rounded-sm" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Ionicons name="alert-circle-outline" size={64} color="#fa5252" />
        <Text className="text-lg font-bold text-ink mt-4 text-center">Ups! Terjadi kesalahan</Text>
        <Pressable onPress={() => router.back()} className="mt-8 bg-surface-tertiary px-6 py-3 rounded-xl">
          <Text className="text-ink font-semibold">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* 1. STICKY READING PROGRESS */}
      <View 
        className="absolute z-50 left-0 right-0 h-[3px] bg-transparent"
        style={{ top: insets.top }}
      >
        <Animated.View className="h-full bg-[#1A8917]" style={progressWidth} />
      </View>

      {/* 2. CUSTOM PERSISTENT BACK BUTTON */}
      <View 
        className="absolute z-50 left-5" 
        style={{ top: insets.top + 12 }} // Jarak yang pas dari status bar
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-white/90 rounded-full shadow-sm border border-black/5"
        >
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </Pressable>
      </View>

      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onContentSizeChange={(_, height) => {
          contentHeight.value = height;
        }}
      >
        {/* LAYOUT BARU: Title -> Image -> Author -> Content */}
        
        {/* Title Section */}
        <Animated.View 
          className="px-5 pt-24 pb-6"
          entering={FadeInDown.duration(600)}
        >
          <Text className="text-2xl font-bold text-ink leading-tight font-serif mb-2">
            {post.title}
          </Text>
        </Animated.View>

        {/* Parallax Image Section */}
        {post.coverImage && (
          <View style={{ height: HEADER_IMAGE_HEIGHT, width: SCREEN_WIDTH, overflow: 'hidden' }} className="mb-6">
            <AnimatedImage
              source={{ uri: post.coverImage }}
              style={[{ width: '100%', height: '100%' }, headerImageStyle]}
              contentFit="cover"
              sharedTransitionTag={`image-${post.id}`}
              cachePolicy="memory-disk" // Mengoptimalkan render di APK
            />
          </View>
        )}

        {/* Author Section */}
        <Animated.View 
          className="px-5 mb-6"
          entering={FadeIn.delay(300)}
        >
          <AuthorCard author={post.author} createdAt={post.publishedAt || post.createdAt} />
          <View className="h-[1px] bg-surface-tertiary mt-2" />
        </Animated.View>

        {/* Article Body Content Section */}
        <Animated.View 
          className="px-5"
          entering={FadeIn.delay(500).duration(800)}
        >
          {(() => {
            let runningListIndex = 0;
            return post.bodyModel.paragraphs.map((p, idx) => {
              // If current paragraph is an ordered list item
              if (p.type === 'OLI') {
                const currentListIndex = runningListIndex;
                runningListIndex++;
                return <ParagraphRenderer key={p.id} paragraph={p} index={idx} listIndex={currentListIndex} />;
              } else {
                // Reset index if we break the list sequence
                runningListIndex = 0;
                return <ParagraphRenderer key={p.id} paragraph={p} index={idx} />;
              }
            });
          })()}

          {/* Tags */}
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
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom Engagement Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-surface-tertiary flex-row items-center justify-between px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={handleLike} className="flex-row items-center mr-6 active:opacity-60">
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.isLiked ? '#fa5252' : '#868e96'}
            />
            <Text className="text-sm font-medium text-ink-secondary ml-1.5">{post.likesCount}</Text>
          </Pressable>

          <Pressable onPress={() => router.push(`/comments/${post.id}`)} className="flex-row items-center active:opacity-60">
            <Ionicons name="chatbubble-outline" size={22} color="#868e96" />
            <Text className="text-sm font-medium text-ink-secondary ml-1.5">{post.commentsCount}</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleShare} className="p-2 active:opacity-60">
          <Ionicons name="share-outline" size={24} color="#868e96" />
        </Pressable>
      </View>
    </View>
  );
}
