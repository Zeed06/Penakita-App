// src/hooks/useProfile.ts
// Hook to fetch user profile, their posts, and handle follow interaction

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { UserProfile } from '../types/user.types';
import type { FeedResponse } from '../types/post.types';

export function useProfile(username: string) {
  const queryClient = useQueryClient();

  // 1. Fetch User Profile
  const profileQuery = useQuery({
    queryKey: ['user', username],
    queryFn: () => userService.getProfile(username),
    enabled: !!username,
  });

  // 2. Fetch User Posts (Infinite)
  const postsQuery = useInfiniteQuery({
    queryKey: ['user', username, 'posts'],
    queryFn: ({ pageParam }) =>
      userService.getUserPosts(username, { limit: 10, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedResponse) => lastPage.nextCursor ?? undefined,
    enabled: !!username,
  });

  // 3. Toggle Follow Mutation (Optimistic Update)
  const followMutation = useMutation({
    mutationFn: (u: string) => userService.toggleFollow(u),
    onMutate: async (u) => {
      // Cancel outgoing refetches for this user
      await queryClient.cancelQueries({ queryKey: ['user', u] });

      // Snapshot the previous profile
      const previousProfile = queryClient.getQueryData<UserProfile>(['user', u]);

      // Optimistically update
      if (previousProfile) {
        const isNowFollowing = !previousProfile.isFollowing;
        queryClient.setQueryData<UserProfile>(['user', u], {
          ...previousProfile,
          isFollowing: isNowFollowing,
          followersCount: isNowFollowing
            ? previousProfile.followersCount + 1
            : Math.max(0, previousProfile.followersCount - 1),
        });
      }

      return { previousProfile };
    },
    onError: (err, u, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['user', u], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', username] });
      // Invalidate posts/following feed since it should now reflect the change
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleToggleFollow = () => {
    if (profileQuery.data?.username) {
      followMutation.mutate(profileQuery.data.username);
    }
  };

  return {
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    profileError: profileQuery.error,

    posts: postsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    fetchNextPosts: postsQuery.fetchNextPage,
    hasNextPosts: postsQuery.hasNextPage,
    isFetchingNextPosts: postsQuery.isFetchingNextPage,
    isLoadingPosts: postsQuery.isLoading,

    handleToggleFollow,
    isFollowingLoading: followMutation.isPending,
  };
}

export function useUserSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ['users', 'search', query],
    queryFn: ({ pageParam }) =>
      userService.searchUsers({ q: query, limit: 10, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!query,
  });
}
