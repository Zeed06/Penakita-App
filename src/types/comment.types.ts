// src/types/comment.types.ts
// Comment content and response types for Penakita

import type { Markup } from './post.types';

export interface CommentContent {
  text: string;
  markups?: Markup[];
}

export interface CommentUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  userId?: string;
  parentId?: string | null;
  content: CommentContent;
  isDeleted?: boolean;
  createdAt: string;
  user: CommentUser;
}

export interface CommentResponse {
  items: Comment[];
  nextCursor: string | null;
}

export interface CreateCommentRequest {
  content: CommentContent;
  parentId?: string | null;
}

export interface UpdateCommentRequest {
  content: CommentContent;
}

export interface ReportCommentRequest {
  category: 'spam' | 'inappropriate' | 'hate_speech' | 'plagiarism' | 'other';
  reason?: string;
}
