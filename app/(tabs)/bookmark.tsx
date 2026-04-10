// app/(tabs)/bookmark.tsx
// Bookmark screen — Coming Soon placeholder with Medium-like aesthetic

import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarkScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      {/* Header — Medium style */}
      <View className="px-5 pt-4 pb-3 border-b border-surface-tertiary">
        <Text className="text-2xl font-bold text-ink tracking-tight">
          Tersimpan
        </Text>
      </View>

      {/* Coming Soon Illustration */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-24 h-24 rounded-full bg-surface-secondary items-center justify-center mb-6">
          <Ionicons name="bookmark-outline" size={48} color="#adb5bd" />
        </View>

        <Text className="text-2xl font-bold text-ink text-center mb-3">
          Segera Hadir
        </Text>

        <Text className="text-base text-ink-secondary text-center leading-6 mb-2 max-w-[280px]">
          Simpan artikel menarik untuk dibaca nanti. Fitur bookmark akan segera tersedia.
        </Text>

        {/* Decorative subtle divider */}
        <View className="w-16 h-[2px] bg-surface-tertiary rounded-full mt-6 mb-6" />

        <Text className="text-sm text-ink-faint text-center leading-5 max-w-[260px]">
          Kamu akan bisa menandai artikel favorit dan mengaksesnya kapan saja dari sini.
        </Text>
      </View>
    </View>
  );
}
