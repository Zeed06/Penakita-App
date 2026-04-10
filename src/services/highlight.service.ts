// src/services/highlight.service.ts
// Highlight API service — CRUD for text highlights

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type {
  Highlight,
  HighlightResponse,
  CreateHighlightRequest,
} from '../types/highlight.types';

export const highlightService = {
  getHighlights: async (postId: string): Promise<Highlight[]> => {
    const response = await api.get<{ data: Highlight[] }>(
      ENDPOINTS.HIGHLIGHTS.LIST(postId),
    );
    return response.data.data;
  },

  createHighlight: async (
    postId: string,
    data: CreateHighlightRequest,
  ): Promise<Highlight> => {
    const response = await api.post<{ data: Highlight }>(
      ENDPOINTS.HIGHLIGHTS.CREATE(postId),
      data,
    );
    return response.data.data;
  },

  deleteHighlight: async (
    postId: string,
    highlightId: string,
  ): Promise<void> => {
    await api.delete(ENDPOINTS.HIGHLIGHTS.DELETE(postId, highlightId));
  },
};
