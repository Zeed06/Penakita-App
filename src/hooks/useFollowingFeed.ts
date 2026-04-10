// src/hooks/useFollowingFeed.ts
// TanStack Query infinite query for the "Following" feed

import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '../services/post.service';
import { useAuthStore } from '../stores/auth.store';

export function useFollowingFeed() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useInfiniteQuery({
    queryKey: ['posts', 'following'],
    queryFn: ({ pageParam }) =>
      postService.getFollowingFeed({ limit: 10, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isLoggedIn,
  });
}
