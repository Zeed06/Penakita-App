// src/hooks/useSearch.ts
// TanStack Query infinite query for search with debounce

import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postService } from '../services/post.service';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['posts', 'search', debouncedQuery],
    queryFn: ({ pageParam }) =>
      postService.searchPosts({
        q: debouncedQuery,
        limit: 10,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: debouncedQuery.length > 0,
  });

  return {
    query,
    setQuery,
    debouncedQuery,
    ...infiniteQuery,
  };
}
