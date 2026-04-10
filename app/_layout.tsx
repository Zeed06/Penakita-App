// app/_layout.tsx
// Root layout — initializes auth state, controls routing guards, wraps providers

import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../src/stores/auth.store';
import { QueryProvider } from '../src/providers/QueryProvider';

import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';

cssInterop(Image, { className: 'style' });

// Keep splash screen visible until we determine auth state
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoggedIn, isLoading, initialize } = useAuthStore();

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Routing guard — redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }

    SplashScreen.hideAsync();
  }, [isLoggedIn, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4c6ef5" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="editor" />
        <Stack.Screen 
          name="post/[slug]" 
          options={{ 
            animation: 'fade',
            presentation: 'transparentModal', // Optional: can help with smooth shared element if needed
            headerShown: false 
          }} 
        />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootNavigator />
    </QueryProvider>
  );
}
