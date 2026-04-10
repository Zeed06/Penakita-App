// src/hooks/useHighlights.ts
// Hook to manage highlights for a specific post

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { highlightService } from '../services/highlight.service';
import type { CreateHighlightRequest } from '../types/highlight.types';

export function useHighlights(postId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['highlights', postId],
    queryFn: () => highlightService.getHighlights(postId),
    enabled: !!postId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHighlightRequest) =>
      highlightService.createHighlight(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (highlightId: string) =>
      highlightService.deleteHighlight(postId, highlightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', postId] });
    },
  });

  return {
    highlights: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createHighlight: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteHighlight: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
