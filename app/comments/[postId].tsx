// app/comments/[postId].tsx
// Comments Screen — list of comments with infinite scroll and interaction handlers

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
const AnyFlashList = FlashList as any;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useComments } from '../../src/hooks/useComments';
import { CommentCard } from '../../src/components/comments/CommentCard';
import { CommentInput } from '../../src/components/comments/CommentInput';
import type { Comment } from '../../src/types/comment.types';

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    createComment,
    isCreating,
    updateComment,
    isUpdating,
    deleteComment,
    reportComment,
  } = useComments(postId);

  const [replyTo, setReplyTo] = useState<{
    username: string;
    commentId: string;
  } | null>(null);

  const [editTo, setEditTo] = useState<{
    commentId: string;
    text: string;
  } | null>(null);

  const flatComments = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data?.pages]);

  const handleReply = useCallback((comment: Comment) => {
    setEditTo(null);
    setReplyTo({
      username: comment.user.username,
      commentId: comment.id,
    });
  }, []);

  const handleEdit = useCallback((comment: Comment) => {
    setReplyTo(null);
    setEditTo({
      commentId: comment.id,
      text: comment.content.text,
    });
  }, []);

  const handleDelete = useCallback(
    async (commentId: string) => {
      Alert.alert(
        'Hapus Komentar?',
        'Anda tidak dapat membatalkan tindakan ini.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteComment(commentId);
                Toast.show({
                  type: 'success',
                  text1: 'Komentar dihapus',
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Gagal menghapus komentar',
                });
              }
            },
          },
        ]
      );
    },
    [deleteComment]
  );

  const handleReport = useCallback(
    async (commentId: string) => {
      // In a real app, this would show a bottom sheet with categories
      // For now, we simulate with a simple alert
      Alert.alert(
        'Laporkan Komentar?',
        'Beri tahu kami jika komentar ini melanggar peraturan komunitas.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Laporkan',
            onPress: async () => {
              try {
                await reportComment({
                  commentId,
                  data: { category: 'spam', reason: 'Pelanggaran peraturan komunitas' },
                });
                Toast.show({
                  type: 'success',
                  text1: 'Laporan terkirim',
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1: 'Gagal mengirim laporan',
                });
              }
            },
          },
        ]
      );
    },
    [reportComment]
  );

  const handleSubmit = useCallback(
    async (text: string) => {
      try {
        if (editTo) {
          await updateComment({
            commentId: editTo.commentId,
            data: { content: { text } }
          });
          setEditTo(null);
          Toast.show({
            type: 'success',
            text1: 'Komentar diperbarui',
          });
        } else {
          await createComment({
            content: { text },
            parentId: replyTo?.commentId || undefined,
          });
          setReplyTo(null);
          Toast.show({
            type: 'success',
            text1: 'Komentar terkirim',
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: editTo ? 'Gagal membarui komentar' : 'Gagal mengirim komentar',
        });
      }
    },
    [createComment, updateComment, replyTo, editTo]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentCard
        comment={item}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReport={handleReport}
      />
    ),
    [handleReply, handleEdit, handleDelete, handleReport]
  );

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const ListEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20 px-10">
        <Ionicons name="chatbubbles-outline" size={48} color="#adb5bd" />
        <Text className="text-base text-ink-secondary mt-4 font-semibold text-center">
          Belum ada komentar
        </Text>
        <Text className="text-sm text-ink-faint mt-2 text-center">
          Jadilah yang pertama untuk memberikan tanggapan!
        </Text>
      </View>
    );
  }, [isLoading]);

  const ListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#4c6ef5" />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Komentar',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#212529" />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4c6ef5" />
        </View>
      ) : (
        <AnyFlashList
          data={flatComments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={100}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <CommentInput
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        replyTo={replyTo}
        editTo={editTo}
        initialValue={editTo?.text}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditTo(null)}
      />
    </View>
  );
}
