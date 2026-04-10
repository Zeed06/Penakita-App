// src/types/post.types.ts
// Post content model types — source of truth for bodyModel rendering

export type ParagraphType =
  | 'P'
  | 'H1'
  | 'H2'
  | 'BQ1'
  | 'BQ2'
  | 'PRE'
  | 'IMG'
  | 'VID'
  | 'HR'
  | 'OLI'
  | 'ULI'
  | 'link';

export type MarkupType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'link';

export interface Markup {
  start: number;
  end: number;
  type: MarkupType;
  href?: string;
}

export interface ParagraphMetadata {
  src?: string;
  alt?: string;
  caption?: string;
  language?: string;
  href?: string;
}

export interface Paragraph {
  id: string;
  type: ParagraphType;
  text?: string;
  markups?: Markup[];
  metadata?: ParagraphMetadata;
}

export interface BodyModel {
  paragraphs: Paragraph[];
}

export interface Author {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  bodyModel: BodyModel;
  author: Author;
  tags?: string[];
  status: 'draft' | 'published';
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface FeedResponse {
  items: Post[];
  nextCursor: string | null;
}

export interface CreatePostResponse {
  data: {
    id: string;
    slug: string;
    status: 'draft' | 'published';
  };
}
