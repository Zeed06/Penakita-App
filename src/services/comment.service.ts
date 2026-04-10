// src/services/comment.service.ts
// Comment API service — fetch, create, update, delete, report

import { api } from './api';
import { ENDPOINTS } from '../constants/api';
import type {
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  ReportCommentRequest,
  Comment,
} from '../types/comment.types';

export const commentService = {
  getComments: async (
    postId: string,
    params: { limit?: number; cursor?: string } = {}
  ): Promise<CommentResponse> => {
    const response = await api.get<CommentResponse>(ENDPOINTS.COMMENTS.LIST(postId), {
      params,
    });
    return response.data;
  },

  createComment: async (
    postId: string,
    data: CreateCommentRequest
  ): Promise<Comment> => {
    const response = await api.post<{ data: Comment }>(
      ENDPOINTS.COMMENTS.CREATE(postId),
      data
    );
    return response.data.data;
  },

  updateComment: async (
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> => {
    const response = await api.put<{ data: Comment }>(
      ENDPOINTS.COMMENTS.UPDATE(commentId),
      data
    );
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(ENDPOINTS.COMMENTS.DELETE(commentId));
  },

  reportComment: async (
    commentId: string,
    data: ReportCommentRequest
  ): Promise<void> => {
    await api.post(ENDPOINTS.COMMENTS.REPORT(commentId), data);
  },
};
