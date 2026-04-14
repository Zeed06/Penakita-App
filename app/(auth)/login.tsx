// app/(auth)/login.tsx
// Login screen with email/password form + Google OAuth

import { useState, useCallback, useEffect } from 'react';
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
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { loginSchema, type LoginFormData } from '../../src/validations/auth.schema';
import { authService } from '../../src/services/auth.service';
import { TokenStorage } from '../../src/utils/tokenStorage';
import { useAuthStore } from '../../src/stores/auth.store';
import { getErrorFromResponse } from '../../src/utils/errorHandler';
import { queryClient } from '../../src/providers/QueryProvider';


export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // ── Google OAuth Success Handler ──
  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setIsGoogleLoading(true);
    try {
      const data = await authService.googleAuth(idToken);

      await TokenStorage.set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        tokenType: data.tokenType,
      });

      await setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        tokenType: data.tokenType,
      });
      
      // Force refresh profile data on landed tabs
      await queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });

      if (data.isNewUser) {
        Toast.show({ type: 'success', text1: 'Selamat datang di Penakita! 🎉' });
      } else if (data.linked) {
        Toast.show({ type: 'success', text1: 'Akun Google berhasil ditautkan' });
      }

      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = getErrorFromResponse(error);
      if (message) {
        Toast.show({ type: 'error', text1: message });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [setTokens, router]);





  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ── Email/Password Login ──
  const onSubmit = useCallback(
    async (formData: LoginFormData) => {
      if (isRateLimited) return;
      setIsSubmitting(true);
      setUnverifiedEmail(null);

      try {
        const data = await authService.login({
          email: formData.email,
          password: formData.password,
          clientType: 'mobile',
        });

        await TokenStorage.set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          tokenType: data.tokenType,
        });

        await setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          tokenType: data.tokenType,
        });

        // Force refresh profile data on landed tabs
        await queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });

        // The RootLayout or App wrapper will handle fetching the profile
        // and setting it in the store once isLoggedIn becomes true.

        router.replace('/(tabs)');
      } catch (error: unknown) {
        const apiError = extractErrorCode(error);

        if (apiError === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(formData.email);
        } else if (apiError === 'RATE_LIMITED') {
          setIsRateLimited(true);
          // Auto-unlock after 5 minutes
          setTimeout(() => setIsRateLimited(false), 5 * 60 * 1000);
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
    [isRateLimited, setUser, setTokens, router],
  );

  // ── Resend Verification ──
  const handleResendVerification = useCallback(async () => {
    if (!unverifiedEmail || isResending) return;
    setIsResending(true);
    try {
      await authService.resendVerification(unverifiedEmail);
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
  }, [unverifiedEmail, isResending]);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // userInfo.data.idToken contains the JWT token needed by the backend
      if (userInfo.data?.idToken) {
        await handleGoogleSuccess(userInfo.data.idToken);
      } else {
        throw new Error('Gagal mendapatkan ID Token dari Google');
      }
    } catch (error: any) {
      setIsGoogleLoading(false);
      console.error('Google Sign-In Error Details:', error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow peacefully
            break;
          case statusCodes.IN_PROGRESS:
            Toast.show({ type: 'info', text1: 'Proses login sedang berjalan' });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({ type: 'error', text1: 'Layanan Google Play tidak tersedia' });
            break;
          default:
            // For modern versions, many dev errors come through as code 10 or 12500
            Toast.show({ 
              type: 'error', 
              text1: 'Login Google gagal: ' + (error.message || 'Error Konfigurasi'),
              text2: 'Pastikan SHA-1 dan Client ID sudah sesuai di Google Console.'
            });
        }
      } else {
        Toast.show({ 
          type: 'error', 
          text1: 'Login Google gagal',
          text2: error instanceof Error ? error.message : 'Kesalahan tidak dikenal'
        });
      }
    }
  }, [handleGoogleSuccess]);



  const isDisabled = isSubmitting || isRateLimited;

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
              Masuk
            </Text>
            <Text className="text-base text-ink-tertiary mt-2">
              Selamat datang kembali di Penakita
            </Text>
          </View>

          {/* Rate Limited Banner */}
          {isRateLimited && (
            <View className="bg-danger/10 rounded-xl p-4 mb-6">
              <Text className="text-danger-dark text-sm font-medium">
                Terlalu banyak percobaan. Coba lagi dalam 5 menit.
              </Text>
            </View>
          )}

          {/* Unverified Email Banner */}
          {unverifiedEmail && (
            <View className="bg-primary-50 rounded-xl p-4 mb-6">
              <Text className="text-primary-800 text-sm mb-3">
                Email belum diverifikasi. Cek inbox-mu.
              </Text>
              <Pressable
                onPress={handleResendVerification}
                disabled={isResending}
                className="self-start active:opacity-70"
              >
                <Text className="text-primary-600 font-semibold text-sm">
                  {isResending ? 'Mengirim...' : 'Kirim ulang verifikasi'}
                </Text>
              </Pressable>
            </View>
          )}

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
                  editable={!isDisabled}
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
          <View className="mb-6">
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
                    placeholder="Masukkan password"
                    placeholderTextColor="#adb5bd"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isDisabled}
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

          {/* Login Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isDisabled}
            className={`rounded-xl py-4 items-center mb-4 ${
              isDisabled ? 'bg-primary-200' : 'bg-primary-600 active:bg-primary-700'
            }`}
          >
            <Text className="text-white font-semibold text-base">
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-surface-tertiary" />
            <Text className="mx-4 text-ink-faint text-sm">atau</Text>
            <View className="flex-1 h-px bg-surface-tertiary" />
          </View>

          {/* Google Login Button */}
          <Pressable
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading || isRateLimited}
            className={`flex-row items-center justify-center rounded-xl py-4 border border-surface-tertiary ${
              isGoogleLoading ? 'opacity-60' : 'active:bg-surface-secondary'
            }`}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text className="text-ink font-medium text-base ml-3">
              {isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
            </Text>
          </Pressable>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-ink-tertiary text-sm">
              Belum punya akun?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-primary-600 font-semibold text-sm">
                  Daftar
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Helper: extract error code from Axios error ──
function extractErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const resp = error as { response?: { data?: { error?: { code?: string } } } };
    return resp.response?.data?.error?.code ?? null;
  }
  return null;
}
