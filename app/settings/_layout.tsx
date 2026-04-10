// app/settings/_layout.tsx
// Stack layout for settings screens

import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerTintColor: '#212529',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: '600' },
      }}
    />
  );
}
