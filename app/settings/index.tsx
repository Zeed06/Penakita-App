// app/settings/index.tsx
// Main settings menu list

import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogoutAll } from '../../src/hooks/useSettings';
import Toast from 'react-native-toast-message';

export default function SettingsIndexScreen() {
  const { mutate: logoutAll, isPending } = useLogoutAll();

  const handleLogoutAll = () => {
    Alert.alert(
      'Keluar dari Semua Perangkat?',
      'Kamu akan dikeluarkan dari Penakita di semua perangkat yang saat ini aktif.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar Semua',
          style: 'destructive',
          onPress: () => {
            logoutAll(undefined, {
              onError: () => {
                Toast.show({
                  type: 'error',
                  text1: 'Gagal',
                  text2: 'Terjadi kesalahan saat logout sistem',
                });
              },
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingVertical: 16 }}>
      <Stack.Screen options={{ title: 'Pengaturan' }} />

      <View className="mb-6">
        <Text className="text-sm font-semibold text-ink-faint uppercase px-5 mb-2 tracking-wider">
          Profil & Akun
        </Text>
        <View className="bg-white border-y border-border-faint">
          <Link href="/settings/profile" asChild>
            <Pressable className="flex-row items-center justify-between px-5 py-4 border-b border-border-faint">
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#495057" />
                <Text className="text-base text-ink ml-3">Edit Profil</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
            </Pressable>
          </Link>
          <Link href="/settings/avatar" asChild>
            <Pressable className="flex-row items-center justify-between px-5 py-4 border-b border-border-faint">
              <View className="flex-row items-center">
                <Ionicons name="image-outline" size={20} color="#495057" />
                <Text className="text-base text-ink ml-3">Ubah Avatar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
            </Pressable>
          </Link>
          <Link href="/settings/password" asChild>
            <Pressable className="flex-row items-center justify-between px-5 py-4">
              <View className="flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#495057" />
                <Text className="text-base text-ink ml-3">Ganti Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
            </Pressable>
          </Link>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-sm font-semibold text-ink-faint uppercase px-5 mb-2 tracking-wider">
          Keamanan & Sesi
        </Text>
        <View className="bg-white border-y border-border-faint">
          <Link href="/settings/sessions" asChild>
            <Pressable className="flex-row items-center justify-between px-5 py-4 border-b border-border-faint">
              <View className="flex-row items-center">
                <Ionicons name="hardware-chip-outline" size={20} color="#495057" />
                <Text className="text-base text-ink ml-3">Sesi Aktif</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
            </Pressable>
          </Link>
          <Pressable 
            disabled={isPending}
            onPress={handleLogoutAll}
            className="flex-row items-center justify-between px-5 py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="warning-outline" size={20} color="#f03e3e" />
              <Text className="text-base text-red-600 ml-3">Keluar dari Semua Perangkat</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
