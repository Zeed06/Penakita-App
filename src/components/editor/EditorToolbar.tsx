// src/components/editor/EditorToolbar.tsx
// Toolbar for changing block types and adding markups

import React from 'react';
import { View, Pressable, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEditorStore } from '../../stores/editor.store';
import type { ParagraphType } from '../../types/post.types';

export function EditorToolbar() {
  const activeParagraphId = useEditorStore((state) => state.activeParagraphId);
  const paragraphs = useEditorStore((state) => state.paragraphs);
  const updateParagraph = useEditorStore((state) => state.updateParagraph);
  const addParagraph = useEditorStore((state) => state.addParagraph);

  const activeParagraph = paragraphs.find((p) => p.id === activeParagraphId);

  const toggleType = (type: ParagraphType) => {
    if (!activeParagraphId) return;
    
    // Toggle: if it's already the target type, revert to 'P'
    const newType = activeParagraph?.type === type ? 'P' : type;
    updateParagraph(activeParagraphId, { type: newType });
  };

  const handleAddNew = () => {
    addParagraph(activeParagraphId || undefined, 'P');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-surface-tertiary"
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row py-2 px-3"
      >
        <ToolButton 
          icon="add" 
          onPress={handleAddNew} 
          primary
        />
        
        <View className="w-px h-6 bg-surface-tertiary mx-2 self-center" />
        
        <ToolButton 
          label="H1" 
          active={activeParagraph?.type === 'H1'}
          onPress={() => toggleType('H1')} 
        />
        <ToolButton 
          label="H2" 
          active={activeParagraph?.type === 'H2'}
          onPress={() => toggleType('H2')} 
        />
        <ToolButton 
          icon="text" 
          active={activeParagraph?.type === 'P'}
          onPress={() => toggleType('P')} 
        />
        <ToolButton 
          icon="code-slash" 
          active={activeParagraph?.type === 'PRE'}
          onPress={() => toggleType('PRE')} 
        />
        <ToolButton 
          icon="options" 
          active={activeParagraph?.type === 'BQ1'}
          onPress={() => toggleType('BQ1')} 
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface ToolButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  active?: boolean;
  primary?: boolean;
  onPress: () => void;
}

function ToolButton({ icon, label, active, primary, onPress }: ToolButtonProps) {
  return (
    <Pressable 
      onPress={onPress}
      className={`h-10 px-3 min-w-[40px] items-center justify-center rounded-lg mx-1 ${
        primary ? 'bg-primary-600' : active ? 'bg-indigo-100' : 'bg-transparent'
      }`}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color={primary ? 'white' : active ? '#4c6ef5' : '#495057'} 
        />
      )}
      {label && (
        <Text className={`font-bold ${active ? 'text-primary-600' : 'text-ink-secondary'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
