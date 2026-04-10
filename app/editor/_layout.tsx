// app/editor/_layout.tsx
// Separate layout for editor screens to ensure proper Stack Navigation headers

import { Stack } from 'expo-router';

export default function EditorLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true, // Default to showing headers in the editor flow
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#ffffff' },
      }} 
    />
  );
}
