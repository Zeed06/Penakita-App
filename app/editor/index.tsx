// app/editor/index.tsx
// Main post drafting screen containing the block editor

import React, { useState, useRef } from 'react';
import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, Text, ActivityIndicator, Keyboard } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { useEditorStore } from '../../src/stores/editor.store';
import { BlockEditor, EditorToolbar } from '../../src/components/editor';
import { useCreateDraft, useUpdatePost } from '../../src/hooks/useEditor';
import { uploadToCloudinary } from '../../src/utils/cloudinary';

export default function EditorDraftScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Editor State
  const title = useEditorStore((state) => state.title);
  const paragraphs = useEditorStore((state) => state.paragraphs);
  const coverImage = useEditorStore((state) => state.coverImage);
  const setTitle = useEditorStore((state) => state.setTitle);
  const setCoverImage = useEditorStore((state) => state.setCoverImage);

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handlePublishFlow = () => {
    // Check if the post meets minimum requirements to publish
    if (!title.trim() || paragraphs.length === 0 || !paragraphs[0].text?.trim()) {
      Toast.show({ type: 'error', text1: 'Isi tidak lengkap', text2: 'Judul dan isi artikel harus diisi.' });
      return;
    }
    
    // Navigate straight to publish screen (tags selection) without saving a draft
    router.push('/editor/publish');
  };

  const handlePickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;

      setIsUploadingCover(true);
      const uploadedUrl = await uploadToCloudinary(result.assets[0].uri);
      setCoverImage(uploadedUrl);
      Toast.show({ type: 'success', text1: 'Gambar sampul diunggah' });
    } catch (error) {
      console.error('[Upload Cover Error]', error);
      Toast.show({ type: 'error', text1: 'Gagal mengunggah gambar' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Tulis Artikel',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="close" size={24} color="#212529" />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row items-center space-x-2">
              <Pressable 
                onPress={handlePublishFlow}
                className="bg-primary-600 px-4 py-1.5 rounded-full"
              >
                <Text className="text-white font-semibold">Terbitkan</Text>
              </Pressable>
            </View>
          )
        }} 
      />

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 300 }}
      >
        {/* Title Input */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Judul Artikel..."
          placeholderTextColor="#ced4da"
          multiline
          className="text-3xl font-bold text-ink mb-6"
          style={{ lineHeight: 40 }}
        />

        {/* Cover Image Section */}
        {coverImage ? (
          <View className="relative mb-6 rounded-xl overflow-hidden bg-surface-tertiary">
            <Image 
              source={{ uri: coverImage }} 
              className="w-full aspect-video" 
              contentFit="cover"
            />
            <Pressable 
              onPress={handleRemoveCover}
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
            >
              <Ionicons name="trash-outline" size={20} color="white" />
            </Pressable>
          </View>
        ) : (
          <Pressable 
            onPress={handlePickCoverImage}
            disabled={isUploadingCover}
            className="mb-6 h-40 border-2 border-dashed border-surface-tertiary rounded-xl items-center justify-center bg-surface-secondary active:opacity-70"
          >
            {isUploadingCover ? (
              <ActivityIndicator color="#4c6ef5" />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color="#adb5bd" />
                <Text className="text-ink-tertiary mt-2 font-medium">Tambah Gambar Sampul</Text>
              </>
            )}
          </Pressable>
        )}
        
        {/* Block Editor */}
        <BlockEditor scrollViewRef={scrollViewRef} />
        
      </ScrollView>

      {/* Formatting Accessories */}
      <EditorToolbar />
    </KeyboardAvoidingView>
  );
}
