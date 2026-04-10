// app/settings/password.tsx
// Change password form

import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import { useSettingsProfile, useChangePassword } from '../../src/hooks/useSettings';
import { changePasswordSchema, type ChangePasswordForm } from '../../src/validations/settings.schema';
import { getErrorFromResponse } from '../../src/utils/errorHandler';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile } = useSettingsProfile();
  const { mutate: changePassword, isPending: isChanging } = useChangePassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    changePassword(
      {
        currentPassword: data.currentPassword || undefined,
        newPassword: data.newPassword,
        clientType: 'mobile',
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil',
            text2: 'Password berhasil diperbarui',
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
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  const hasPassword = profile?.hasPassword ?? true;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20 }}>
      <Stack.Screen options={{ title: 'Ganti Password' }} />

      <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
        <Text className="text-blue-700 text-sm leading-5">
          Setelah ganti password, semua sesi di perangkat lain akan dikeluarkan secara otomatis demi keamanan akunmu.
        </Text>
      </View>

      <View className="space-y-6">
        {/* Current Password */}
        {hasPassword && (
          <View>
            <Text className="text-sm font-semibold text-ink-secondary mb-2">
              Password Saat Ini
            </Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-secondary px-4 py-3 rounded-xl text-ink text-base border ${
                    errors.currentPassword ? 'border-red-500' : 'border-transparent'
                  }`}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  placeholder="Masukkan password lama"
                  placeholderTextColor="#adb5bd"
                />
              )}
            />
            {errors.currentPassword && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.currentPassword.message}
              </Text>
            )}
          </View>
        )}

        {/* New Password */}
        <View>
          <Text className="text-sm font-semibold text-ink-secondary mb-2">
            Password Baru
          </Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-surface-secondary px-4 py-3 rounded-xl text-ink text-base border ${
                  errors.newPassword ? 'border-red-500' : 'border-transparent'
                }`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                placeholder="Minimal 8 karakter"
                placeholderTextColor="#adb5bd"
              />
            )}
          />
          {errors.newPassword && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.newPassword.message}
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View>
          <Text className="text-sm font-semibold text-ink-secondary mb-2">
            Konfirmasi Password Baru
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`bg-surface-secondary px-4 py-3 rounded-xl text-ink text-base border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-transparent'
                }`}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
                placeholder="Ulangi password baru"
                placeholderTextColor="#adb5bd"
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        <Pressable
          className={`h-14 rounded-2xl items-center justify-center mt-4 ${
            isChanging ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={isChanging}
        >
          {isChanging ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-base font-bold">Simpan Password</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
