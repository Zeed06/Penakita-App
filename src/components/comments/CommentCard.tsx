// src/components/comments/CommentCard.tsx
// Individual comment component — displays author, content, and reply depth

import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Comment } from '../../types/comment.types';
import { formatDate } from '../../utils/date';
import { useAuthStore } from '../../stores/auth.store';

interface CommentCardProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onEdit?: (comment: Comment) => void;
}

function CommentCardComponent({
  comment,
  onReply,
  onDelete,
  onReport,
  onEdit,
}: CommentCardProps) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isAuthor = currentUserId === comment.userId || currentUserId === comment.user.id;
  const isReply = !!comment.parentId;

  const handleLongPress = () => {
    // Show actions bottom sheet
  };

  if (comment.isDeleted) {
    return (
      <View
        className={`bg-white px-5 py-3 border-b border-surface-tertiary ${isReply ? 'pl-11' : ''
          }`}
      >
        <Text className="text-sm italic text-ink-faint">
          [Komentar ini telah dihapus]
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`bg-white px-5 py-4 border-b border-surface-tertiary ${isReply ? 'pl-11' : ''
        }`}
    >
      {/* Header */}
      <View className="flex-row items-center mb-2">
        {comment.user.avatarUrl ? (
          <Image
            source={{ uri: comment.user.avatarUrl }}
            className="w-6 h-6 rounded-full bg-surface-tertiary"
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="w-6 h-6 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-[10px] font-bold text-primary-600">
              {comment.user.fullName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text className="text-sm font-semibold text-ink ml-2">
          {comment.user.fullName || comment.user.username}
        </Text>
        <Text className="text-ink-faint text-xs ml-2">·</Text>
        <Text className="text-ink-faint text-xs ml-2">
          {formatDate(comment.createdAt)}
        </Text>
      </View>

      {/* Content */}
      <Text className="text-sm text-ink leading-5 mb-3">
        {comment.content.text}
      </Text>

      {/* Footer Actions */}
      <View className="flex-row items-center">
        <Pressable
          onPress={() => onReply?.(comment)}
          hitSlop={8}
          className="flex-row items-center py-1 pr-4"
        >
          <Ionicons name="chatbubble-outline" size={14} color="#868e96" />
          <Text className="text-xs text-ink-secondary ml-1 font-medium">Balas</Text>
        </Pressable>

        {isAuthor ? (
          <View className="flex-row items-center">
            <Pressable
              onPress={() => onEdit?.(comment)}
              hitSlop={8}
              className="flex-row items-center py-1 pr-4"
            >
              <Text className="text-xs text-ink-secondary font-medium">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete?.(comment.id)}
              hitSlop={8}
              className="flex-row items-center py-1 pr-4"
            >
              <Text className="text-xs text-error font-medium">Hapus</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => onReport?.(comment.id)}
            hitSlop={8}
            className="flex-row items-center py-1 pr-4"
          >
            <Text className="text-xs text-ink-faint font-medium">Laporkan</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export const CommentCard = memo(CommentCardComponent);
