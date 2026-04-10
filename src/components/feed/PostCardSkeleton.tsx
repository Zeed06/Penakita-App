// src/components/feed/PostCardSkeleton.tsx
// Skeleton loading placeholder for PostCard with pulse animation

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

function SkeletonBox({ className }: { className: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-surface-tertiary ${className}`}
      style={animatedStyle}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <View className="px-5 py-4 border-b border-surface-tertiary">
      {/* Author Row Skeleton */}
      <View className="flex-row items-center mb-3">
        <SkeletonBox className="w-6 h-6 rounded-full" />
        <SkeletonBox className="w-24 h-3 rounded ml-2" />
        <SkeletonBox className="w-16 h-3 rounded ml-2" />
      </View>

      {/* Content Skeleton */}
      <View className="flex-row">
        <View className="flex-1 pr-3">
          <SkeletonBox className="w-full h-5 rounded mb-2" />
          <SkeletonBox className="w-3/4 h-5 rounded mb-2" />
          <SkeletonBox className="w-full h-3.5 rounded mb-1" />
          <SkeletonBox className="w-2/3 h-3.5 rounded" />
        </View>
        <SkeletonBox className="w-24 h-24 rounded-lg" />
      </View>

      {/* Footer Skeleton */}
      <View className="flex-row items-center mt-3">
        <SkeletonBox className="w-10 h-3 rounded mr-4" />
        <SkeletonBox className="w-10 h-3 rounded" />
      </View>
    </View>
  );
}

export function PostCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </View>
  );
}
