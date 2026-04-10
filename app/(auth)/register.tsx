// app/(auth)/register.tsx
// Register screen with email, password, fullName form

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import {
  registerSchema,
  type RegisterFormData,
} from '../../src/validations/auth.schema';
import { authService } from '../../src/services/auth.service';
import { getErrorFromResponse } from '../../src/utils/errorHandler';

export default function RegisterScreen() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  });

  // ── Register Submit ──
  const onSubmit = useCallback(
    async (formData: RegisterFormData) => {
      setIsSubmitting(true);
      try {
        await authService.register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || formData.email.split('@')[0],
        });

        setRegisteredEmail(formData.email);
      } catch (error: unknown) {
        const apiError = extractErrorCode(error);

        if (apiError === 'EMAIL_TAKEN') {
          Toast.show({
            type: 'error',
            text1: 'Email sudah terdaftar',
          });
        } else {
          const message = getErrorFromResponse(error);
          if (message) {
            Toast.show({ type: 'error', text1: message });
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  // ── Resend Verification ──
  const handleResendVerification = useCallback(async () => {
    if (!registeredEmail || isResending) return;
    setIsResending(true);
    try {
      await authService.resendVerification(registeredEmail);
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
  }, [registeredEmail, isResending]);

  // ── Success State ──
  if (registeredEmail) {
    return (
      <View className="flex-1 bg-white justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-success/10 items-center justify-center mb-6">
            <Ionicons name="mail-outline" size={40} color="#40c057" />
          </View>
          <Text className="text-2xl font-bold text-ink text-center mb-3">
            Cek email untuk verifikasi
          </Text>
          <Text className="text-base text-ink-secondary text-center leading-6">
            Kami telah mengirim link verifikasi ke{' '}
            <Text className="font-semibold text-ink">{registeredEmail}</Text>
          </Text>
        </View>

        <Pressable
          onPress={handleResendVerification}
          disabled={isResending}
          className={`rounded-xl py-4 items-center border border-primary-200 mb-4 ${
            isResending ? 'opacity-60' : 'active:bg-primary-50'
          }`}
        >
          <Text className="text-primary-600 font-semibold text-base">
            {isResending ? 'Mengirim...' : 'Kirim ulang verifikasi'}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="rounded-xl py-4 items-center active:opacity-70">
            <Text className="text-ink-tertiary font-medium text-base">
              Kembali ke Login
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  // ── Register Form ──
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-bold text-ink tracking-tight">
              Daftar
            </Text>
            <Text className="text-base text-ink-tertiary mt-2">
              Buat akun baru di Penakita
            </Text>
          </View>

          {/* Full Name Field (optional) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-ink-secondary mb-2">
              Nama Lengkap{' '}
              <Text className="text-ink-faint">(opsional)</Text>
            </Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 text-base text-ink bg-surface-secondary ${
                    errors.fullName
                      ? 'border-danger'
                      : 'border-surface-tertiary'
                  }`}
                  placeholder="Nama lengkap kamu"
                  placeholderTextColor="#adb5bd"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.fullName && (
              <Text className="text-danger text-xs mt-1">
                {errors.fullName.message}
              </Text>
            )}
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-ink-secondary mb-2">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`border rounded-xl px-4 py-3.5 text-base text-ink bg-surface-secondary ${
                    errors.email ? 'border-danger' : 'border-surface-tertiary'
                  }`}
                  placeholder="nama@email.com"
                  placeholderTextColor="#adb5bd"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.email && (
              <Text className="text-danger text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-ink-secondary mb-2">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="relative">
                  <TextInput
                    className={`border rounded-xl px-4 py-3.5 pr-12 text-base text-ink bg-surface-secondary ${
                      errors.password
                        ? 'border-danger'
                        : 'border-surface-tertiary'
                    }`}
                    placeholder="Minimal 8 karakter"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSubmitting}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-3.5"
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#868e96"
                    />
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-danger text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          <View className="mb-6">
            <Text className="text-xs text-ink-faint leading-5">
              Harus mengandung minimal 1 huruf kapital dan 1 angka
            </Text>
          </View>

          {/* Register Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={`rounded-xl py-4 items-center mb-4 ${
              isSubmitting
                ? 'bg-primary-200'
                : 'bg-primary-600 active:bg-primary-700'
            }`}
          >
            <Text className="text-white font-semibold text-base">
              {isSubmitting ? 'Memproses...' : 'Daftar'}
            </Text>
          </Pressable>

          {/* Login Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-ink-tertiary text-sm">
              Sudah punya akun?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-primary-600 font-semibold text-sm">
                  Masuk
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Helper ──
function extractErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const resp = error as {
      response?: { data?: { error?: { code?: string } } };
    };
    return resp.response?.data?.error?.code ?? null;
  }
  return null;
}
