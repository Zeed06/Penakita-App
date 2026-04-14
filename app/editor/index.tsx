// app/editor/index.tsx
// Single Spacing Editor - Recovered Manual Toolbar and Zero Gap Spacing

import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  ScrollView,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { 
  RichText, 
  useEditorBridge, 
  TenTapStartKit,
  PlaceholderBridge,
  BulletListBridge,
  OrderedListBridge,
} from '@10play/tentap-editor';

import { useEditorStore } from '../../src/stores/editor.store';
import { useCreateDraft, useUpdatePost } from '../../src/hooks/useEditor';
import { uploadToCloudinary } from '../../src/utils/cloudinary';
import { convertTiptapToBodyModel } from '../../src/utils/editor-converter';

// THE "SINGLE SPACING" SECRET:
// Tight paragraphs with margin 0.
// Lists (UL/OL) have padding to show bullets/numbers.
const BULLETPROOF_CSS = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 19px;
      line-height: 1.4 !important;
      color: #292929;
      padding: 10px 0 100px 0 !important;
      margin: 0;
      background-color: #ffffff;
    }
    .ProseMirror { outline: none; min-height: 300px; }
    .ProseMirror p { 
      margin: 0 !important; 
      padding: 0 !important; 
    }
    .ProseMirror h1 { font-size: 28px; margin-top: 5px !important; margin-bottom: 2px !important; }
    
    /* LIST STYLING - Precise Indentation */
    .ProseMirror ul, .ProseMirror ol {
      margin: 0 !important;
      padding-left: 1.5em !important;
      list-style-position: outside !important;
    }
    .ProseMirror li {
      margin: 0 !important;
      padding: 0 !important;
    }
    .ProseMirror li p {
      margin: 0 !important;
      display: inline !important;
    }
    .ProseMirror ul { list-style-type: disc !important; }
    .ProseMirror ol { list-style-type: decimal !important; }

    .is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #ced4da;
      pointer-events: none;
      height: 0;
    }
  </style>
`;

export default function EditorDraftScreen() {
  const router = useRouter();
  
  // Editor Store State
  const title = useEditorStore((state) => state.title);
  const paragraphs = useEditorStore((state) => state.paragraphs);
  const coverImage = useEditorStore((state) => state.coverImage);
  const currentDraftId = useEditorStore((state) => state.currentDraftId);
  const setTitle = useEditorStore((state) => state.setTitle);
  const setCoverImage = useEditorStore((state) => state.setCoverImage);
  const setParagraphs = useEditorStore((state) => state.setParagraphs);
  const setCurrentDraftId = useEditorStore((state) => state.setCurrentDraftId);
  const resetEditor = useEditorStore((state) => state.resetEditor);

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Hooks
  const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost();

  // Initialize Editor Bridge
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    // REMOVED <p></p> TO FIX "ENTER JUMPING 2 LINES"
    initialContent: `${BULLETPROOF_CSS}`,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge,
      BulletListBridge,
      OrderedListBridge,
    ],
    onChange: async () => {
      const json = await editor.getJSON();
      const bodyModel = convertTiptapToBodyModel(json);
      setParagraphs(bodyModel.paragraphs);
    },
    theme: {
      webview: {
        backgroundColor: '#ffffff',
      },
    },
  });

  // Backup injection for stability
  useEffect(() => {
    if (editor) {
      editor.injectCSS(BULLETPROOF_CSS.replace('<style>', '').replace('</style>', ''));
      editor.setPlaceholder('Mulai menulis cerita Anda...');
    }
  }, [editor]);

  const handlePublishFlow = () => {
    if (!title.trim() || paragraphs.length === 0 || !paragraphs.some(p => p.text?.trim())) {
      Toast.show({ type: 'error', text1: 'Isi tidak lengkap', text2: 'Judul dan isi artikel harus diisi.' });
      return;
    }
    router.push('/editor/publish');
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Judul kosong', text2: 'Berikan judul sebelum menyimpan draft.' });
      return;
    }

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
    } catch (error) {
      console.error('[Upload Cover Error]', error);
      Toast.show({ type: 'error', text1: 'Gagal mengunggah gambar' });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const CustomToolbar = () => (
    <View style={styles.manualToolbar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
        <Pressable onPress={() => editor.toggleBold()} style={styles.toolbarBtn}>
          <MaterialCommunityIcons name="format-bold" size={24} color="#495057" />
        </Pressable>
        <Pressable onPress={() => editor.toggleItalic()} style={styles.toolbarBtn}>
          <MaterialCommunityIcons name="format-italic" size={24} color="#495057" />
        </Pressable>
        <Pressable onPress={() => editor.toggleHeading(1)} style={styles.toolbarBtn}>
          <MaterialCommunityIcons name="format-header-1" size={24} color="#495057" />
        </Pressable>
        <Pressable onPress={() => editor.toggleOrderedList()} style={styles.toolbarBtn}>
          <MaterialCommunityIcons name="format-list-numbered" size={24} color="#495057" />
        </Pressable>
        <Pressable onPress={() => editor.toggleBulletList()} style={styles.toolbarBtn}>
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#495057" />
        </Pressable>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
                onPress={handleSaveDraft} 
                disabled={isCreatingDraft || isUpdatingPost}
                className="px-3 py-1.5"
              >
                <Text className="text-primary-600 font-semibold">Simpan</Text>
              </Pressable>
              <Pressable onPress={handlePublishFlow} className="bg-primary-600 px-4 py-1.5 rounded-full ml-2">
                <Text className="text-white font-semibold">Terbitkan</Text>
              </Pressable>
            </View>
          )
        }} 
      />

      <View style={{ flex: 1 }}>
        <View className="px-5 pt-3">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Judul Artikel..."
            placeholderTextColor="#ced4da"
            multiline
            className="text-3xl font-bold text-ink mb-1"
            style={{ lineHeight: 40 }}
          />

          {coverImage ? (
            <View className="relative mb-3 rounded-xl overflow-hidden bg-surface-tertiary">
              <Image source={{ uri: coverImage }} className="w-full h-48" contentFit="cover" />
              <Pressable onPress={() => setCoverImage(null)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
            </View>
          ) : (
            <Pressable 
              onPress={handlePickCoverImage}
              disabled={isUploadingCover}
              className="mb-3 h-14 border-2 border-dashed border-surface-tertiary rounded-xl flex-row items-center justify-center bg-surface-secondary"
            >
              {isUploadingCover ? <ActivityIndicator color="#4c6ef5" /> : (
                <>
                  <Ionicons name="image-outline" size={22} color="#adb5bd" />
                  <Text className="text-ink-tertiary ml-2 font-medium">Tambah Gambar Sampul</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <RichText editor={editor} style={{ flex: 1 }} />
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.absToolbar}
      >
        <CustomToolbar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  absToolbar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    zIndex: 1000,
  },
  manualToolbar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    height: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  toolbarContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  toolbarBtn: {
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  }
});
