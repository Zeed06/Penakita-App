// app/(tabs)/_layout.tsx
// Bottom tab navigation layout — Medium-inspired 5-tab design

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import { useSettingsProfile } from '../../src/hooks/useSettings';
import { useAuthStore } from '../../src/stores/auth.store';
import { View, Text } from 'react-native';

export default function TabsLayout() {
  const { data: profile } = useSettingsProfile();
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        fullName: profile.fullName,
        bio: null, // default
        avatarUrl: profile.avatarUrl,
        provider: 'email',
        emailVerified: profile.isEmailVerified,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });
    }
  }, [profile, setUser]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#212529',
        tabBarInactiveTintColor: '#adb5bd',
        tabBarStyle: {
          borderTopColor: '#f1f3f5',
          backgroundColor: '#ffffff',
          height: 60,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cari',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: 'Tersimpan',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => {
            if (user?.avatarUrl) {
              return (
                <View className={`rounded-full p-[2px] ${focused ? 'border-2 border-ink' : ''}`}>
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="w-6 h-6 rounded-full"
                    contentFit="cover"
                    transition={200}
                  />
                </View>
              );
            }
            if (user?.fullName) {
              return (
                <View className={`w-7 h-7 rounded-full items-center justify-center bg-primary-100 ${focused ? 'border-2 border-primary-600' : ''}`}>
                  <Text className="text-xs font-bold text-primary-600">
                    {(user.username || user.fullName || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              );
            }
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={color}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
