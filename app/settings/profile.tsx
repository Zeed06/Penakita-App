// app/settings/profile.tsx
// Edit profile form - username and full name

import React, { useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { useSettingsProfile, useUpdateProfile } from '../../src/hooks/useSettings';
import { updateProfileSchema, type UpdateProfileForm } from '../../src/validations/settings.schema';
import { getErrorFromResponse } from '../../src/utils/errorHandler';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile } = useSettingsProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: '',
      fullName: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        fullName: profile.fullName,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: UpdateProfileForm) => {
    if (!isDirty) {
      Toast.show({
        type: 'info',
        text1: 'Informasi',
        text2: 'Tidak ada perubahan untuk disimpan',
      });
      return;
    }

    updateProfile(data, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Berhasil',
          text2: 'Profil berhasil diperbarui',
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
    });
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      <Stack.Screen options={{ title: 'Edit Profil' }} />

      <View className="space-y-6">
        {/* Full Name */}
        <View>
          <Text className="text-sm font-semibold text-ink-secondary mb-2">
            Nama Lengkap
          </Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-surface-secondary px-4 py-3 rounded-xl text-ink text-base border ${
                  errors.fullName ? 'border-red-500' : 'border-transparent'
                }`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#adb5bd"
              />
            )}
          />
          {errors.fullName && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.fullName.message}
            </Text>
          )}
        </View>

        {/* Username */}
        <View>
          <Text className="text-sm font-semibold text-ink-secondary mb-2">
            Username
          </Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-surface-secondary px-4 py-3 rounded-xl text-ink text-base border ${
                  errors.username ? 'border-red-500' : 'border-transparent'
                }`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                placeholder="Masukkan username"
                placeholderTextColor="#adb5bd"
              />
            )}
          />
          {errors.username && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.username.message}
            </Text>
          )}
        </View>

        {/* Email - Readonly */}
        <View>
          <Text className="text-sm font-semibold text-ink-secondary mb-2">
            Email
          </Text>
          <View className="bg-surface-secondary px-4 py-3 rounded-xl opacity-60">
            <Text className="text-ink text-base">{profile?.email}</Text>
          </View>
          <Text className="text-ink-faint text-xs mt-2 ml-1">
            Email tidak dapat diubah
          </Text>
        </View>

        <Pressable
          className={`h-14 rounded-2xl items-center justify-center mt-4 ${
            isUpdating || !isDirty ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isUpdating || !isDirty}
        >
          {isUpdating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-bold">Simpan Perubahan</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
