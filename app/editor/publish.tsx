// app/editor/publish.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams as useLocal, useRouter as useExpRouter, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useTags, usePublishArticle, useCreateDraft, useUpdatePost } from '../../src/hooks/useEditor';
import { useEditorStore } from '../../src/stores/editor.store';

export default function PublishScreen() {
  const router = useExpRouter();
  const { title, paragraphs, coverImage, currentDraftId, setCurrentDraftId, resetEditor } = useEditorStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { data: tags, isLoading: isTagsLoading } = useTags();
  const { mutate: publishArticle, isPending: isPublishing } = usePublishArticle();
  const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost();

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter(t => t !== tagId);
      }
      if (prev.length >= 5) {
        Toast.show({ type: 'info', text1: 'Batas Tag', text2: 'Maksimal 5 tag.' });
        return prev;
      }
      return [...prev, tagId];
    });
  };

  const handlePublish = () => {
    publishArticle(
      { 
        title, 
        bodyModel: { paragraphs }, 
        coverImage: coverImage || undefined,
        tags: selectedTags 
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Artikel Diterbitkan! 🎉' });
          resetEditor(); // clear draft
          router.replace('/(tabs)');
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.error?.message || 'Coba beberapa saat lagi.';
          Toast.show({ type: 'error', text1: 'Gagal Menerbitkan', text2: errorMessage });
        }
      }
    );
  };

  const handleSaveDraft = () => {
    const data: any = { 
      title, 
      bodyModel: { paragraphs } 
    };
    if (coverImage) data.coverImage = coverImage;

    if (currentDraftId) {
      updatePost(
        { id: currentDraftId, data },
        {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'berhasil simpan Di Drafts' });
          resetEditor();
          router.replace('/(tabs)');
        },
          onError: (err: any) => {
            const msg = err?.response?.data?.error?.message || 'Coba lagi nanti.';
            Toast.show({ type: 'error', text1: 'Gagal memperbarui draft', text2: msg });
          }
        }
      );
    } else {
      createDraft(data, {
        onSuccess: (result) => {
          setCurrentDraftId(result.id);
          Toast.show({ type: 'success', text1: 'berhasil simpan Di Drafts' });
          resetEditor();
          router.replace('/(tabs)');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error?.message || 'Coba lagi nanti.';
          Toast.show({ type: 'error', text1: 'Gagal menyimpan draft', text2: msg });
        }
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Topik Pilihan',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#212529" />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row items-center space-x-2">
              <Pressable 
                onPress={handleSaveDraft} 
                disabled={isCreatingDraft || isUpdatingPost || isPublishing}
                className="px-3 py-1.5"
              >
                <Text className="text-primary-600 font-semibold text-sm">Simpan</Text>
              </Pressable>
              <Pressable 
                onPress={handlePublish}
                disabled={isPublishing || isCreatingDraft || isUpdatingPost}
                className={`bg-primary-600 px-4 py-1.5 rounded-full ml-1 ${isPublishing ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-semibold text-sm">
                  {isPublishing ? '...' : 'Terbitkan'}
                </Text>
              </Pressable>
            </View>
          )
        }} 
      />

      <ScrollView className="flex-1 px-5 pt-6">
        {coverImage && (
          <View className="mb-6 rounded-xl overflow-hidden bg-surface-tertiary">
            <Image
              source={{ uri: coverImage }}
              className="w-full h-48"
              contentFit="cover"
            />
          </View>
        )}

        <Text className="text-xl font-bold text-ink mb-2">
          Pilih Topik Terkait
        </Text>
        <Text className="text-ink-secondary mb-6 leading-5">
          Pilih hingga 5 tag agar pembaca lebih mudah menemukan cerita Anda.
        </Text>

        {isTagsLoading ? (
          <ActivityIndicator size="large" color="#4c6ef5" className="mt-10" />
        ) : (
          <View className="flex-row flex-wrap">
            {tags?.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full border mr-3 mb-4 flex-row items-center space-x-1 ${
                    isSelected 
                      ? 'bg-primary-50 border-primary-500' 
                      : 'bg-white border-surface-tertiary'
                  }`}
                >
                  <Text 
                    className={`font-medium ${
                      isSelected ? 'text-primary-700' : 'text-ink-secondary'
                    }`}
                  >
                    {tag.name}
                  </Text>
                  {isSelected && <Ionicons name="close-circle" size={16} color="#4c6ef5" className="ml-1" />}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
