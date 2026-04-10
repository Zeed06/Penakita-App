// src/hooks/useEditor.ts
// React query hooks for post creation, updating, and publishing

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';
import { postService } from '../services/post.service';
import { tagService } from '../services/tag.service';
import type { BodyModel, Post } from '../types/post.types';

export function useCreateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; bodyModel: BodyModel; coverImage?: string | null }) =>
      postService.createDraft(data),
    onSuccess: () => {
      // Refresh all post lists
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; bodyModel?: BodyModel; coverImage?: string | null } }) =>
      postService.updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(['post', updatedPost.slug], updatedPost);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
      return await postService.publishPost(id, tags);
    },
    onSuccess: (publishedPost) => {
      const user = useAuthStore.getState().user;
      const completePost: Post = {
        ...publishedPost,
        author: publishedPost.author || {
          id: user?.id || 'temp',
          username: user?.username || 'user',
          fullName: user?.fullName || 'User',
          avatarUrl: user?.avatarUrl || null,
        }
      };
      
      queryClient.setQueryData(['post', completePost.slug], completePost);
      // Removed invalidateQueries to prevent stale backend refetch
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      title, 
      bodyModel, 
      coverImage, 
      tags 
    }: { 
      title: string; 
      bodyModel: BodyModel; 
      coverImage?: string | null; 
      tags: string[] 
    }) => {
      // Step 1: Create draft
      const draft = await postService.createDraft({ title, bodyModel, coverImage });
      // Step 2: Publish draft
      const published = await postService.publishPost(draft.id, tags);
      return published;
    },
    onSuccess: (publishedPost) => {
      const user = useAuthStore.getState().user;
      const completePost: Post = {
        ...publishedPost,
        author: publishedPost.author || {
          id: user?.id || 'temp',
          username: user?.username || 'user',
          fullName: user?.fullName || 'User',
          avatarUrl: user?.avatarUrl || null,
        }
      };

      queryClient.setQueryData(['post', completePost.slug], completePost);
      
      // Inject to feed explicitly
      queryClient.setQueryData(['posts', 'feed'], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          items: [completePost, ...newPages[0].items],
        };
        return { ...oldData, pages: newPages };
      });

      queryClient.invalidateQueries({ queryKey: ['posts', 'drafts'] }); // Only refresh drafts, let feed rely on manual injection
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getTags(),
  });
}
