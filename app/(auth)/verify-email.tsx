// app/(auth)/verify-email.tsx
// Verify email screen — resend verification link

import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { authService } from '../../src/services/auth.service';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [isResending, setIsResending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const handleResend = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || isResending) return;

    setIsResending(true);
    try {
      await authService.resendVerification(trimmedEmail);
      setHasSent(true);
      Toast.show({
        type: 'success',
        text1: 'Email verifikasi dikirim ulang',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Gagal mengirim ulang email verifikasi',
      });
    } finally {
      setIsResending(false);
    }
  }, [email, isResending]);

  return (
    <View className="flex-1 bg-white justify-center px-6">
      {/* Icon */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-primary-50 items-center justify-center mb-6">
          <Ionicons name="mail-unread-outline" size={48} color="#4c6ef5" />
        </View>

        <Text className="text-2xl font-bold text-ink text-center mb-3">
          Verifikasi Email
        </Text>
        <Text className="text-base text-ink-secondary text-center leading-6 px-4">
          Cek email kamu untuk link verifikasi. Jika tidak menerima email, klik
          tombol di bawah untuk mengirim ulang.
        </Text>
      </View>

      {/* Email Input */}
      {!params.email && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-ink-secondary mb-2">
            Email
          </Text>
          <TextInput
            className="border border-surface-tertiary rounded-xl px-4 py-3.5 text-base text-ink bg-surface-secondary"
            placeholder="nama@email.com"
            placeholderTextColor="#adb5bd"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!isResending}
          />
        </View>
      )}

      {/* Show email if pre-filled */}
      {params.email && (
        <View className="bg-surface-secondary rounded-xl p-4 mb-6">
          <Text className="text-sm text-ink-tertiary text-center">
            Email verifikasi dikirim ke
          </Text>
          <Text className="text-base font-semibold text-ink text-center mt-1">
            {params.email}
          </Text>
        </View>
      )}

      {/* Success Feedback */}
      {hasSent && (
        <View className="bg-success/10 rounded-xl p-4 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#40c057" />
            <Text className="text-success-dark text-sm font-medium ml-2">
              Email verifikasi telah dikirim ulang
            </Text>
          </View>
        </View>
      )}

      {/* Resend Button */}
      <Pressable
        onPress={handleResend}
        disabled={isResending || !email.trim()}
        className={`rounded-xl py-4 items-center mb-4 ${
          isResending || !email.trim()
            ? 'bg-primary-200'
            : 'bg-primary-600 active:bg-primary-700'
        }`}
      >
        <Text className="text-white font-semibold text-base">
          {isResending ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
        </Text>
      </Pressable>

      {/* Back to Login */}
      <Link href="/(auth)/login" asChild>
        <Pressable className="rounded-xl py-4 items-center active:opacity-70">
          <View className="flex-row items-center">
            <Ionicons name="arrow-back" size={18} color="#868e96" />
            <Text className="text-ink-tertiary font-medium text-base ml-2">
              Kembali ke Login
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
