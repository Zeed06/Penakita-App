// src/components/profile/UserCard.tsx
// Compact card for user search results

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Avatar } from '../ui';
import type { UserProfile } from '../../types/user.types';

interface UserCardProps {
  user: UserProfile;
}

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link href={`/user/${user.username}`} asChild>
      <Pressable className="flex-row items-center px-5 py-3 bg-white">
        <Avatar
          uri={user.avatarUrl}
          name={user.username}
          size={48}
        />
        
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-base font-bold text-ink" numberOfLines={1}>
            {user.fullName}
          </Text>
          <Text className="text-sm text-ink-faint" numberOfLines={1}>
            @{user.username}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-xs font-semibold text-indigo-600">
            {user.followersCount} Pengikut
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};
