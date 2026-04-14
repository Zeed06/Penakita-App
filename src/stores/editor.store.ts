import { create } from 'zustand';
import type { Paragraph, ParagraphType, Markup } from '../types/post.types';
import { generateId } from '../utils/id';

interface EditorState {
  title: string;
  paragraphs: Paragraph[];
  coverImage: string | null;
  activeParagraphId: string | null;
  currentDraftId: string | null;

  // Actions
  setTitle: (title: string) => void;
  setCoverImage: (uri: string | null) => void;
  setActiveParagraph: (id: string | null) => void;
  setCurrentDraftId: (id: string | null) => void;
  
  // Block Operations
  addParagraph: (afterId?: string, type?: ParagraphType, text?: string) => void;
  updateParagraph: (id: string, updates: Partial<Omit<Paragraph, 'id'>>) => void;
  removeParagraph: (id: string) => void;
  
  // Load/Reset
  setParagraphs: (paragraphs: Paragraph[]) => void;
  resetEditor: () => void;
}

const createEmptyParagraph = (type: ParagraphType = 'P', text = ''): Paragraph => ({
  id: generateId(),
  type,
  text,
  markups: [],
});

const DEFAULT_STATE = {
  title: '',
  paragraphs: [createEmptyParagraph()],
  coverImage: null,
  activeParagraphId: null,
  currentDraftId: null,
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  ...DEFAULT_STATE,

  setTitle: (title) => set({ title }),

  setCoverImage: (coverImage) => set({ coverImage }),
  
  setActiveParagraph: (id) => set({ activeParagraphId: id }),

  setCurrentDraftId: (id) => set({ currentDraftId: id }),

  addParagraph: (afterId, type = 'P', text = '') => set((state) => {
    const newPara = createEmptyParagraph(type, text);
    if (!afterId) {
      return {
        paragraphs: [...state.paragraphs, newPara],
        activeParagraphId: newPara.id,
      };
    }
    
    const index = state.paragraphs.findIndex((p) => p.id === afterId);
    if (index === -1) return state; // if not found, do nothing
    
    const newParagraphs = [...state.paragraphs];
    newParagraphs.splice(index + 1, 0, newPara);

    return {
      paragraphs: newParagraphs,
      activeParagraphId: newPara.id, // Focus new paragraph automatically
    };
  }),

  updateParagraph: (id, updates) => set((state) => {
    return {
      paragraphs: state.paragraphs.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    };
  }),

  removeParagraph: (id) => set((state) => {
    const idx = state.paragraphs.findIndex((p) => p.id === id);
    if (idx === -1) return state;
    if (state.paragraphs.length === 1) {
      // Keep at least one block if this was the last one
      return { paragraphs: [createEmptyParagraph('P')] };
    }
    
    const newParagraphs = state.paragraphs.filter((p) => p.id !== id);
    
    // Focus previous block if possible
    const nextActiveId = idx > 0 ? newParagraphs[idx - 1].id : newParagraphs[0].id;

    return {
      paragraphs: newParagraphs,
      activeParagraphId: nextActiveId,
    };
  }),

  setParagraphs: (paragraphs) => set({ paragraphs }),

  resetEditor: () => set(DEFAULT_STATE),
}));
