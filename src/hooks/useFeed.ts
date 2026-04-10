// src/hooks/useFeed.ts
// TanStack Query infinite query for the main "Untukmu" feed

import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '../services/post.service';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }) =>
      postService.getFeed({ limit: 10, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
