// src/types/highlight.types.ts
// Highlight types for text selection highlighting feature

export interface Highlight {
  id: string;
  postId: string;
  paragraphId: string;
  startIndex: number;
  endIndex: number;
  text: string;
  createdAt: string;
}

export interface HighlightResponse {
  items: Highlight[];
  nextCursor: string | null;
}

export interface CreateHighlightRequest {
  paragraphId: string;
  startIndex: number;
  endIndex: number;
  text: string;
}
