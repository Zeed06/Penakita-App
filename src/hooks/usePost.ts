// src/hooks/usePost.ts
// Hook to fetch post detail and handle optimistic like interaction
// with cross-cache synchronization to keep feeds in sync

import { useQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { postService } from '../services/post.service';
import type { Post, FeedResponse } from '../types/post.types';

export function usePost(slug: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postService.getPostBySlug(slug),
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onMutate: async (postId) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['post', slug] });

      // 2. Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(['post', slug]);

      // 3. Optimistically update post detail
      if (previousPost) {
        const newIsLiked = !previousPost.isLiked;
        const newLikesCount = newIsLiked
          ? previousPost.likesCount + 1
          : previousPost.likesCount - 1;

        queryClient.setQueryData<Post>(['post', slug], {
          ...previousPost,
          isLiked: newIsLiked,
          likesCount: newLikesCount,
        });

        // 4. Cross-cache sync: update like count in ALL feed caches
        queryClient.setQueriesData<InfiniteData<FeedResponse>>(
          { queryKey: ['posts'] },
          (oldData) => {
            if (!oldData || !oldData.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === postId
                    ? { ...item, isLiked: newIsLiked, likesCount: newLikesCount }
                    : item,
                ),
              })),
            };
          },
        );

        // Also sync user profile posts caches
        queryClient.setQueriesData<InfiniteData<FeedResponse>>(
          { queryKey: ['user'], exact: false },
          (oldData) => {
            if (!oldData?.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === postId
                    ? { ...item, isLiked: newIsLiked, likesCount: newLikesCount }
                    : item,
                ),
              })),
            };
          },
        );
      }

      // 5. Return context with the snapshotted value
      return { previousPost };
    },
    onError: (_err, _postId, context) => {
      // If mutation fails, roll back to the snapshotted value
      if (context?.previousPost) {
        queryClient.setQueryData(['post', slug], context.previousPost);
      }
      // Also invalidate feeds to revert optimistic changes
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleLike = () => {
    if (query.data?.id) {
      likeMutation.mutate(query.data.id);
    }
  };

  return {
    ...query,
    handleLike,
    isLiking: likeMutation.isPending,
  };
}
