// src/components/profile/FollowButton.tsx
// Unified follow/unfollow button with nativewind styling

import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  isLoading: boolean;
}

export const FollowButton = ({
  isFollowing,
  onPress,
  isLoading,
}: FollowButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`px-6 py-2 rounded-full border items-center justify-center flex-row ${
        isFollowing
          ? 'bg-transparent border-border'
          : 'bg-indigo-600 border-indigo-600'
      }`}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? '#4c6ef5' : '#ffffff'}
          className="mr-2"
        />
      ) : null}
      <Text
        className={`font-semibold text-sm ${
          isFollowing ? 'text-ink-secondary' : 'text-white'
        }`}
      >
        {isFollowing ? 'Mengikuti' : 'Ikuti'}
      </Text>
    </Pressable>
  );
};
