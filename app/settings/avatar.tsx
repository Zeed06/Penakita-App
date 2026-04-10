import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

import { useSettingsProfile, useUpdateAvatar } from '../../src/hooks/useSettings';
import { getErrorFromResponse } from '../../src/utils/errorHandler';
import { Avatar } from '../../src/components/ui';

export default function UpdateAvatarScreen() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: profile, isLoading: isLoadingProfile } = useSettingsProfile();
  const { mutate: updateAvatar, isPending: isUpdating } = useUpdateAvatar();

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      console.log('--- Pick Image Result ---');
      console.log('Asset URI:', asset.uri);
      console.log('Asset Type:', asset.mimeType || asset.type);
      
      setIsUploading(true);
      
      console.log('Calling updateAvatar directly with local URI...');
      updateAvatar(
        asset.uri,
        {
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: 'Berhasil',
              text2: 'Avatar berhasil diperbarui',
            });
            router.back();
          },
          onError: (error) => {
            Toast.show({
              type: 'error',
              text1: 'Gagal',
              text2: getErrorFromResponse(error),
            });
          },
          onSettled: () => setIsUploading(false),
        }
      );
    } catch (error) {
      setIsUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: 'Terjadi kesalahan saat memilih gambar',
      });
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert(
      'Hapus Avatar',
      'Apakah kamu yakin ingin menghapus foto profil?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            updateAvatar(
              null,
              {
                onSuccess: () => {
                  Toast.show({
                    type: 'success',
                    text1: 'Berhasil',
                    text2: 'Avatar telah dihapus',
                  });
                  router.back();
                },
                onError: (error) => {
                  Toast.show({
                    type: 'error',
                    text1: 'Gagal',
                    text2: getErrorFromResponse(error),
                  });
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  const isAnyLoading = isUploading || isUpdating;

  return (
    <View className="flex-1 bg-white items-center px-10 pt-16">
      <Stack.Screen options={{ title: 'Ubah Avatar' }} />

      <View className="relative mb-12">
        <Avatar
          uri={profile?.avatarUrl}
          name={profile?.username}
          size={192}
        />
        {isAnyLoading && (
          <View className="absolute inset-0 bg-black/20 rounded-full items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>

      <View className="w-full space-y-4">
        <Pressable
          className={`h-14 rounded-2xl items-center justify-center bg-indigo-600 ${
            isAnyLoading ? 'opacity-50' : 'opacity-100'
          }`}
          onPress={handlePickImage}
          disabled={isAnyLoading}
        >
          <Text className="text-white text-base font-bold">Pilih Foto dari Galeri</Text>
        </Pressable>

        {profile?.avatarUrl && (
          <Pressable
            className="h-14 rounded-2xl items-center justify-center border border-red-100"
            onPress={handleRemoveAvatar}
            disabled={isAnyLoading}
          >
            <Text className="text-red-600 text-base font-semibold">Hapus Foto Profil</Text>
          </Pressable>
        )}
      </View>

      <Text className="text-ink-faint text-xs text-center mt-8 leading-5">
        Foto profil membantu orang lain mengenalimu di Penakita.
      </Text>
    </View>
  );
}
