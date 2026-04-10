// src/components/profile/ProfileHeader.tsx
// Profile header with avatar, name, and following stats

import React from 'react';
import { View, Text } from 'react-native';
import { FollowButton } from './FollowButton';
import { Avatar } from '../ui';
import type { UserProfile } from '../../types/user.types';

interface ProfileHeaderProps {
  user: UserProfile;
  isSelf?: boolean;
  onToggleFollow: () => void;
  isFollowingLoading: boolean;
}

export const ProfileHeader = ({
  user,
  isSelf,
  onToggleFollow,
  isFollowingLoading,
}: ProfileHeaderProps) => {
  return (
    <View className="bg-white px-5 pt-8 pb-6 border-b border-border-faint">
      <View className="flex-row items-center justify-between mb-5">
        <Avatar
          uri={user.avatarUrl}
          name={user.username}
          size={80}
        />
        
        {!isSelf && (
          <FollowButton
            isFollowing={!!user.isFollowing}
            onPress={onToggleFollow}
            isLoading={isFollowingLoading}
          />
        )}
      </View>

      <Text className="text-2xl font-bold text-ink mb-1">{user.fullName}</Text>
      <Text className="text-base text-ink-faint mb-4">@{user.username}</Text>

      {user.bio ? (
        <Text className="text-base text-ink-secondary mb-5 leading-6">
          {user.bio}
        </Text>
      ) : null}

      <View className="flex-row items-center space-x-6">
        <View className="flex-row items-baseline">
          <Text className="text-lg font-bold text-ink mr-1.5">
            {user.followersCount}
          </Text>
          <Text className="text-sm text-ink-faint">Pengikut</Text>
        </View>

        <View className="flex-row items-baseline">
          <Text className="text-lg font-bold text-ink mr-1.5">
            {user.followingCount}
          </Text>
          <Text className="text-sm text-ink-faint">Mengikuti</Text>
        </View>
      </View>
    </View>
  );
};
