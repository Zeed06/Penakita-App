// src/components/comments/CommentInput.tsx
// Fixed input bar for comments and replies

import { useState, useCallback, useRef, useEffect as import_react_useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting?: boolean;
  replyTo?: {
    username: string;
    commentId: string;
  } | null;
  editTo?: {
    commentId: string;
  } | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  initialValue?: string;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  isSubmitting,
  replyTo,
  editTo,
  onCancelReply,
  onCancelEdit,
  initialValue = '',
  placeholder = 'Tulis komentar...',
}: CommentInputProps) {
  const [text, setText] = useState(initialValue);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  import_react_useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || isSubmitting) return;

    try {
      await onSubmit(text.trim());
      setText('');
      inputRef.current?.blur();
    } catch (error) {
      // Error handled by parent hook
    }
  }, [text, isSubmitting, onSubmit]);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View
        className="bg-white border-t border-surface-tertiary"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        {/* Reply Preview */}
        {replyTo && (
          <View className="flex-row items-center justify-between px-5 py-2.5 bg-surface-secondary border-b border-surface-tertiary">
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="#868e96" />
              <Text className="text-xs text-ink-secondary ml-2">
                Membalas <Text className="font-bold">@{replyTo.username}</Text>
              </Text>
            </View>
            <Pressable onPress={onCancelReply} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#adb5bd" />
            </Pressable>
          </View>
        )}
        
        {/* Edit Preview */}
        {editTo && (
          <View className="flex-row items-center justify-between px-5 py-2.5 bg-blue-50 border-b border-blue-100">
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={12} color="#3b82f6" />
              <Text className="text-xs text-blue-600 font-medium ml-2">
                Mengedit Komentar
              </Text>
            </View>
            <Pressable onPress={onCancelEdit} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#3b82f6" />
            </Pressable>
          </View>
        )}

        <View className="flex-row items-end px-4 py-3">
          <View className="flex-1 min-h-[40px] bg-surface-secondary rounded-[20px] px-4 py-2 border border-surface-tertiary">
            <TextInput
              ref={inputRef}
              className="text-base text-ink leading-5 p-0"
              placeholder={placeholder}
              placeholderTextColor="#adb5bd"
              multiline
              maxLength={1000}
              value={text}
              onChangeText={setText}
              style={{ maxHeight: 120 }}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`ml-3 mb-1 w-10 h-10 rounded-full items-center justify-center ${canSubmit ? 'bg-primary-600' : 'bg-surface-tertiary'
              }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={canSubmit ? '#ffffff' : '#adb5bd'}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
