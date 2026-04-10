// app/settings/sessions.tsx
// Active sessions management screen

import React from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessions, useRevokeSession } from '../../src/hooks/useSettings';
import Toast from 'react-native-toast-message';

export default function ActiveSessionsScreen() {
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    Alert.alert(
      'Tutup Sesi Ini?',
      'Perangkat ini akan segera dikeluarkan dari akunmu.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tutup Sesi',
          style: 'destructive',
          onPress: () => {
            revokeSession(sessionId, {
              onSuccess: () => {
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil',
                  text2: 'Sesi telah ditutup',
                });
              },
              onError: (error) => {
                Toast.show({
                  type: 'error',
                  text1: 'Gagal',
                  text2: 'Tidak bisa menutup sesi saat ini',
                });
              },
            });
          },
        },
      ]
    );
  };

  if (isLoadingSessions) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingVertical: 16 }}>
      <Stack.Screen options={{ title: 'Sesi Aktif' }} />

      <View className="bg-blue-50 p-4 rounded-xl mx-5 mb-6 border border-blue-100">
        <Text className="text-blue-700 text-sm leading-5">
          Daftar perangkat yang saat ini sedang login ke akunmu. Kamu bisa menutup sesi perangkat yang tidak kamu kenali.
        </Text>
      </View>

      <View className="bg-white border-y border-border-faint">
        {sessions?.map((session, index) => (
          <View 
            key={session.id}
            className={`flex-row items-center px-5 py-5 ${
              index < sessions.length - 1 ? 'border-b border-border-faint' : ''
            }`}
          >
            <View className="bg-surface-secondary w-12 h-12 rounded-full items-center justify-center">
              <Ionicons 
                name={session.deviceType === 'mobile' ? "phone-portrait-outline" : "laptop-outline"} 
                size={24} 
                color="#495057" 
              />
            </View>

            <View className="flex-1 ml-4 pr-4">
              <View className="flex-row items-center mb-1">
                <Text className="text-base font-bold text-ink">
                  {session.userAgent || 'Perangkat Tidak Dikenal'}
                </Text>
                {session.isCurrentSession && (
                  <View className="bg-green-100 px-2 py-0.5 rounded-md ml-2">
                    <Text className="text-[10px] font-bold text-green-700 uppercase">Sesi Ini</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-ink-faint mb-1">
                IP: {session.ipAddress || 'Unknown'}
              </Text>
              <Text className="text-xs text-ink-faint">
                Aktif terakhir: {new Date(session.lastActiveAt).toLocaleString()}
              </Text>
            </View>

            {!session.isCurrentSession && (
              <Pressable
                onPress={() => handleRevoke(session.id)}
                disabled={isRevoking}
                className="p-2 hit-slop-8"
              >
                <Ionicons name="close-circle-outline" size={24} color="#f03e3e" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
