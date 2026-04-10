// src/components/editor/BlockEditor.tsx
// Maps and renders all BlockItems

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useEditorStore } from '../../stores/editor.store';
import { BlockItem } from './BlockItem';

interface BlockEditorProps {
  scrollViewRef: React.RefObject<ScrollView>;
}

export function BlockEditor({ scrollViewRef }: BlockEditorProps) {
  const paragraphs = useEditorStore((state) => state.paragraphs);

  return (
    <View style={styles.container}>
      {paragraphs.map((p, index) => (
        <BlockItem 
          key={p.id} 
          id={p.id} 
          isFirst={index === 0} 
          scrollViewRef={scrollViewRef}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100, // padding for toolbar
  },
});
