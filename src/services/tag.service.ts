// src/services/tag.service.ts
import { api } from './api';
import { ENDPOINTS } from '../constants/api';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export const tagService = {
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<{ data: Tag[] }>(ENDPOINTS.TAGS.LIST);
    return response.data.data;
  },
};
