// src/components/editor/BlockItem.tsx
// Renders a single editable block (paragraph, heading, quote, etc)

import React, { useRef, useEffect } from 'react';
import { TextInput, View, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData, ScrollView, findNodeHandle } from 'react-native';
import type { Paragraph, ParagraphType } from '../../types/post.types';
import { useEditorStore } from '../../stores/editor.store';

interface BlockItemProps {
  id: string;
  isFirst: boolean;
  scrollViewRef: React.RefObject<ScrollView>;
}

export function BlockItem({ id, isFirst, scrollViewRef }: BlockItemProps) {
  const paragraph = useEditorStore((state) => state.paragraphs.find((p) => p.id === id));
  const activeParagraphId = useEditorStore((state) => state.activeParagraphId);
  const updateParagraph = useEditorStore((state) => state.updateParagraph);
  const setActiveParagraph = useEditorStore((state) => state.setActiveParagraph);
  const addParagraph = useEditorStore((state) => state.addParagraph);
  const removeParagraph = useEditorStore((state) => state.removeParagraph);

  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const layoutY = useRef(0);

  const isActive = activeParagraphId === id;

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      
      // Auto-scroll logic: scroll this block towards the middle of the ScrollView
      if (scrollViewRef.current) {
        // We use a small delay to ensure keyboard is accounted for or layout is ready
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, layoutY.current - 150), // 150 is a rough estimation of middle offset
            animated: true,
          });
        }, 100);
      }
    }
  }, [isActive, scrollViewRef]);

  if (!paragraph) return null;

  const handleTextChange = (text: string) => {
    updateParagraph(id, { text });
  };

  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    // We could store the selection globally for the toolbar to know where markups go
    // updateParagraph(id, { currentSelection: e.nativeEvent.selection }); // Need ephemeral state
  };

  const handleKeyPress = (e: any) => {
    const { key } = e.nativeEvent;
    
    if (key === 'Enter') {
      // Prevent default new line inside same block if possible (though multiline makes it tricky)
      // We will allow natural wrapping, but if user hits Enter twice, maybe new block?
      // Actually, standard block editors create a new block on Enter.
      // To strictly intercept Enter on iOS/Android text input, we check if text changed to add a \n
    } else if (key === 'Backspace' && paragraph.text === '' && !isFirst) {
      // Remove this block if it's empty and backspace is pressed
      removeParagraph(id);
    }
  };

  return (
    <View 
      ref={containerRef}
      style={styles.container}
      onLayout={(e) => {
        layoutY.current = e.nativeEvent.layout.y;
      }}
    >
      <TextInput
        ref={inputRef}
        multiline
        value={paragraph.text || ''}
        onChangeText={handleTextChange}
        onSelectionChange={handleSelectionChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setActiveParagraph(id)}
        placeholder={isFirst && paragraph.type === 'P' ? 'Mulai menulis ceritamu...' : 'Gunakan + untuk alat'}
        placeholderTextColor="#adb5bd"
        style={[
          styles.baseText,
          getStyleForType(paragraph.type)
        ]}
        scrollEnabled={false}
      />
    </View>
  );
}

function getStyleForType(type: ParagraphType) {
  switch (type) {
    case 'H1':
      return { fontSize: 24, fontWeight: '700' as const, color: '#212529', marginTop: 16 };
    case 'H2':
      return { fontSize: 20, fontWeight: '600' as const, color: '#343a40', marginTop: 12 };
    case 'BQ1':
      return { borderLeftWidth: 3, borderLeftColor: '#ced4da', paddingLeft: 12, color: '#495057', fontStyle: 'italic' as const };
    default:
      return { fontSize: 15, color: '#212529', lineHeight: 24 };
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    minHeight: 30,
  },
  baseText: {
    textAlignVertical: 'top',
  }
});
