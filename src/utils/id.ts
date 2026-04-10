// src/utils/id.ts
// Utility for generating unique IDs (e.g. for paragraphs)

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
