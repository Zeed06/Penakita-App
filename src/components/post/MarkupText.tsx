// src/components/post/MarkupText.tsx
// Component to render text with multiple markups (bold, italic, link, etc.)

import { useMemo, memo } from 'react';
import { Text, Linking, Pressable } from 'react-native';
import type { Markup, MarkupType } from '../../types/post.types';

interface MarkupSegment {
  text: string;
  types: MarkupType[];
  href?: string;
}

interface MarkupTextProps {
  text: string;
  markups?: Markup[];
  className?: string;
  numberOfLines?: number;
}

function MarkupTextComponent({
  text,
  markups = [],
  className,
  numberOfLines,
}: MarkupTextProps) {
  const segments = useMemo(() => {
    if (!markups.length) return [{ text, types: [] }];

    // 1. Create a sorted list of unique boundaries
    const boundaries = new Set<number>();
    boundaries.add(0);
    boundaries.add(text.length);
    markups.forEach((m) => {
      boundaries.add(m.start);
      boundaries.add(m.end);
    });

    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    // 2. Map segments based on these boundaries
    const result: MarkupSegment[] = [];
    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
      const start = sortedBoundaries[i];
      const end = sortedBoundaries[i + 1];
      const segmentText = text.slice(start, end);

      if (!segmentText) continue;

      // Find all markups that cover this specific range
      const activeMarkups = markups.filter((m) => m.start <= start && m.end >= end);
      const types = activeMarkups.map((m) => m.type);
      const linkMarkup = activeMarkups.find((m) => m.type === 'link');

      result.push({
        text: segmentText,
        types,
        href: linkMarkup?.href,
      });
    }

    return result;
  }, [text, markups]);

  const handleLinkPress = (href?: string) => {
    if (href) {
      Linking.openURL(href).catch((err) => {
        console.error('Failed to open URL:', err);
      });
    }
  };

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => {
        const isLink = segment.types.includes('link');
        const isBold = segment.types.includes('bold');
        const isItalic = segment.types.includes('italic');
        const isUnderline = segment.types.includes('underline');
        const isStrikethrough = segment.types.includes('strikethrough');

        const style = {
          fontWeight: isBold ? '700' : '400',
          fontStyle: isItalic ? 'italic' : 'normal',
          textDecorationLine:
            isUnderline && isStrikethrough
              ? 'underline line-through'
              : isUnderline
                ? 'underline'
                : isStrikethrough
                  ? 'line-through'
                  : 'none',
          color: isLink ? '#4c6ef5' : undefined,
        } as const;

        if (isLink && segment.href) {
          return (
            <Text
              key={`${index}-${segment.text}`}
              style={style}
              onPress={() => handleLinkPress(segment.href)}
            >
              {segment.text}
            </Text>
          );
        }

        return (
          <Text key={`${index}-${segment.text}`} style={style}>
            {segment.text}
          </Text>
        );
      })}
    </Text>
  );
}

export const MarkupText = memo(MarkupTextComponent);
