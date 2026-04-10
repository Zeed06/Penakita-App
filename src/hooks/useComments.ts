// src/hooks/useComments.ts
// Hook to manage comment list with infinite scroll and mutations

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { commentService } from '../services/comment.service';
import { useAuthStore } from '../stores/auth.store';
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  ReportCommentRequest,
  CommentResponse,
  Comment,
} from '../types/comment.types';

export function useComments(postId: string, slug?: string) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) =>
      commentService.getComments(postId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!postId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      commentService.createComment(postId, data),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      const previousComments = queryClient.getQueryData(['comments', postId]);

      const user = useAuthStore.getState().user;
      
      queryClient.setQueryData<InfiniteData<CommentResponse>>(['comments', postId], (old) => {
        if (!old || !old.pages || old.pages.length === 0) return old;

        const fakeComment: Comment = {
          id: `temp-${Date.now()}`,
          postId,
          userId: user?.id || 'temp',
          parentId: newComment.parentId || null,
          content: newComment.content,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          user: {
            id: user?.id || 'temp',
            username: user?.username || 'user',
            fullName: user?.fullName || 'User',
            avatarUrl: user?.avatarUrl || null,
          },
        };

        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          items: [fakeComment, ...newPages[0].items],
        };

        return { ...old, pages: newPages };
      });

      // Universal cache update for commentsCount (Details & Feed)
      queryClient.setQueriesData({ queryKey: ['post'] }, (old: any) => {
        if (!old || old.id !== postId) return old;
        return { ...old, commentsCount: old.commentsCount + 1 };
      });
      
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
              item.id === postId
                ? { ...item, commentsCount: item.commentsCount + 1 }
                : item
            )
          }))
        };
      });

      return { previousComments };
    },
    onSuccess: (savedComment) => {
      // Invalidate and refetch specific comments list in background,
      // but synchronously inject the saved comment to avoid lag
      queryClient.setQueryData<InfiniteData<CommentResponse>>(['comments', postId], (old) => {
        if (!old || !old.pages || old.pages.length === 0) return old;

        // Remove temporary comment and inject the real one
        const newPages = old.pages.map(page => ({
          ...page,
          items: page.items.filter(item => !item.id.startsWith('temp-'))
        }));
        
        // Backend returns the comment DB row but might omit the joined `user` object.
        // Ensure the `user` property is populated using our auth store to prevent crashes!
        const user = useAuthStore.getState().user;
        const completeComment = {
          ...savedComment,
          userId: savedComment.userId || user?.id,
          user: savedComment.user || {
            id: user?.id || 'temp',
            username: user?.username || 'user',
            fullName: user?.fullName || 'User',
            avatarUrl: user?.avatarUrl || null,
          }
        };

        newPages[0].items = [completeComment, ...newPages[0].items];

        return { ...old, pages: newPages };
      });
      // Removed invalidateQueries to prevent rewriting cache with old backend data
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
      if (slug) {
        queryClient.setQueryData(['post', slug], (old: any) => {
          if (!old) return old;
          return { ...old, commentsCount: Math.max(0, old.commentsCount - 1) };
        });
      }
      console.error('[useComments] Create comment failed:', error);
    },
    onSettled: () => {
      // Do nothing, let React Query relying on the manually injected cache
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onMutate: async (commentId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments', postId]);

      // Optimistically update to the new value
      queryClient.setQueryData<InfiniteData<CommentResponse>>(['comments', postId], (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(item => item.id !== commentId)
          }))
        };
      });

      return { previousComments };
    },
    onError: (err, commentId, context) => {
      // Rollback on failure
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', postId], context.previousComments);
      }
      console.error('[useComments] Delete comment failed:', err);
    },
    onSuccess: (_, commentId) => {
      // Removed invalidateQueries to prevent flickering with stale backend data
      // queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // Ensure cache is manually cleaned if not already handled by onMutate
      queryClient.setQueryData<InfiniteData<CommentResponse>>(['comments', postId], (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.filter(item => item.id !== commentId)
          }))
        };
      });

      // Sync counts
      queryClient.setQueriesData({ queryKey: ['post'] }, (old: any) => {
        if (!old || old.id !== postId) return old;
        return { ...old, commentsCount: Math.max(0, old.commentsCount - 1) };
      });

      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
              item.id === postId
                ? { ...item, commentsCount: Math.max(0, item.commentsCount - 1) }
                : item
            )
          }))
        };
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: ReportCommentRequest;
    }) => commentService.reportComment(commentId, data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      commentService.updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData<InfiniteData<CommentResponse>>(['comments', postId], (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            items: page.items.map(item => item.id === updatedComment.id ? { ...item, content: updatedComment.content } : item)
          }))
        };
      });
    }
  });

  return {
    ...query,
    createComment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteComment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateComment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    reportComment: reportMutation.mutateAsync,
    isReporting: reportMutation.isPending,
  };
}
