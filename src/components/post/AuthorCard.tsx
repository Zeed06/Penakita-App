// src/components/post/AuthorCard.tsx
// Author representation for post detail screen

import { memo } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { Author } from '../../types/post.types';
import { formatDate } from '../../utils/date';

interface AuthorCardProps {
  author: Author;
  createdAt: string;
}

function AuthorCardComponent({ author, createdAt }: AuthorCardProps) {

  return (
    <View
      className="flex-row items-center py-4 rounded-lg"
    >
      {author.avatarUrl ? (
        <Image
          source={{ uri: author.avatarUrl }}
          className="w-10 h-10 rounded-full bg-surface-tertiary"
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
          <Text className="text-sm font-bold text-primary-600">
            {author.fullName?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-ink leading-tight">
          {author.fullName || author.username}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-sm text-ink-secondary">
            @{author.username}
          </Text>
          <Text className="text-ink-faint text-xs mx-1.5">·</Text>
          <Text className="text-sm text-ink-faint">
            {formatDate(createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const AuthorCard = memo(AuthorCardComponent);
