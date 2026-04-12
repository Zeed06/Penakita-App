import { generateId } from './id';
import type { BodyModel, Paragraph, ParagraphType, Markup, MarkupType } from '../types/post.types';

/**
 * Converts Tiptap JSON format to our custom BodyModel format for backend compatibility.
 */
export function convertTiptapToBodyModel(tiptapJson: any): BodyModel {
  const paragraphs: Paragraph[] = [];

  if (!tiptapJson || tiptapJson.type !== 'doc' || !tiptapJson.content) {
    return { paragraphs };
  }

  tiptapJson.content.forEach((node: any) => {
    processNode(node, paragraphs);
  });

  return { paragraphs };
}

function processNode(node: any, paragraphs: Paragraph[]) {
  switch (node.type) {
    case 'paragraph':
      // Only push if there is actually content or marks, to prevent ghost lines
      const p = createParagraph(node, 'P');
      if ((p.text?.trim().length ?? 0) > 0 || (p.markups && p.markups.length > 0)) {
        paragraphs.push(p);
      }
      break;
    case 'heading':
      const level = node.attrs?.level || 1;
      paragraphs.push(createParagraph(node, level === 1 ? 'H1' : 'H2'));
      break;
    case 'blockquote':
      paragraphs.push(createParagraph(node, 'BQ1'));
      break;
    case 'codeBlock':
      paragraphs.push(createParagraph(node, 'PRE'));
      break;
    case 'horizontalRule':
      paragraphs.push({ id: generateId(), type: 'HR' });
      break;
    case 'bulletList':
      node.content?.forEach((item: any) => {
        if (item.type === 'listItem') {
          // Flatten bullet list items into individual ULI paragraphs
          item.content?.forEach((inner: any) => processNode({ ...inner, type: 'uli_temp' }, paragraphs));
        }
      });
      break;
    case 'orderedList':
      node.content?.forEach((item: any) => {
        if (item.type === 'listItem') {
          // Flatten ordered list items into individual OLI paragraphs
          item.content?.forEach((inner: any) => processNode({ ...inner, type: 'oli_temp' }, paragraphs));
        }
      });
      break;
    case 'uli_temp':
      paragraphs.push(createParagraph(node, 'ULI'));
      break;
    case 'oli_temp':
      paragraphs.push(createParagraph(node, 'OLI'));
      break;
    case 'image':
      paragraphs.push({
        id: generateId(),
        type: 'IMG',
        metadata: {
          src: node.attrs?.src,
          alt: node.attrs?.alt,
          caption: node.attrs?.title,
        }
      });
      break;
    default:
      // Skip unknown nodes
      break;
  }
}

function createParagraph(node: any, type: ParagraphType): Paragraph {
  let fullText = '';
  const markups: Markup[] = [];

  if (node.content) {
    node.content.forEach((inline: any) => {
      if (inline.type === 'text') {
        const start = fullText.length;
        const textValue = inline.text || '';
        fullText += textValue;
        const end = fullText.length;

        if (inline.marks) {
          inline.marks.forEach((mark: any) => {
            const markupType = mapMarkToType(mark.type);
            if (markupType) {
              markups.push({
                start,
                end,
                type: markupType,
                href: mark.attrs?.href,
              });
            }
          });
        }
      }
    });
  }

  // Merge contiguous markups of the same type (Tiptap splits them sometimes)
  const mergedMarkups = mergeMarkups(markups);

  return {
    id: generateId(),
    type,
    text: fullText,
    markups: mergedMarkups,
  };
}

function mapMarkToType(tiptapMark: string): MarkupType | null {
  switch (tiptapMark) {
    case 'bold': return 'bold';
    case 'italic': return 'italic';
    case 'underline': return 'underline';
    case 'strike': return 'strikethrough';
    case 'link': return 'link';
    default: return null;
  }
}

function mergeMarkups(markups: Markup[]): Markup[] {
  if (markups.length === 0) return [];
  
  const sorted = [...markups].sort((a, b) => a.start - b.start);
  const merged: Markup[] = [];
  
  let current = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.type === current.type && next.start === current.end && next.href === current.href) {
      current.end = next.end;
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  
  return merged;
}
