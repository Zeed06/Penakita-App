// app/(tabs)/profile.tsx
// User's own profile overview within the main tabs

import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { useSettingsProfile } from '../../src/hooks/useSettings';
import { useFeed } from '../../src/hooks/useFeed';
import { PostCard } from '../../src/components/feed/PostCard';

export default function CurrentUserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: profile, isLoading, error } = useSettingsProfile();
  const { data: feedData } = useFeed();

  const [activeTab, setActiveTab] = useState('Stories');
  const [storyFilter, setStoryFilter] = useState<'Draft' | 'Published'>('Published');

  const myPublishedPosts = feedData?.pages
    .flatMap((page) => page.items)
    .filter((post) => post.author.username === profile?.username) || [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1a8917" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-secondary">Gagal memuat profil</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header Settings Icon */}
      <View className="flex-row justify-end p-4">
        <Pressable onPress={() => router.push('/settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color="#6B6B6B" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Info */}
        <View className="px-5 mb-6 flex-row items-center">
          <View className="mr-4">
            {profile.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="w-20 h-20 rounded-full"
                contentFit="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-[#af52de] items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {(profile.fullName || profile.username || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-ink mb-1">
              {profile.fullName || profile.username}
            </Text>
            <Text className="text-sm text-[#6B6B6B]">
              0 followers · 0 following
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-5 mb-6 space-x-3">
          <Pressable className="bg-[#242424] px-6 py-2 rounded-full active:bg-[#1a1a1a]">
            <Text className="text-white font-semibold text-sm">View stats</Text>
          </Pressable>
          <Pressable
            className="border border-[#e6e6e6] px-6 py-2 rounded-full active:bg-[#f6f6f6]"
            onPress={() => router.push('/settings')}
          >
            <Text className="text-ink font-semibold text-sm">Edit your profile</Text>
          </Pressable>
        </View>

        {/* Profile Tabs */}
        <View className="flex-row px-5 border-b border-[#f2f2f2] mb-4 space-x-6 gap-6">
          {['Stories', 'Activity', 'Lists',].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`py-3 ${activeTab === tab ? 'border-b border-ink' : ''}`}
            >
              <Text className={`text-sm ${activeTab === tab ? 'text-ink font-semibold' : 'text-[#6B6B6B]'}`}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        <View className="px-5">
          {activeTab === 'Stories' && (
            <>
              {/* Dropdown UI Mock */}
              <View className="flex-row items-center mb-6">
                <Pressable
                  className={`py-2 px-4 rounded-full border ${storyFilter === 'Draft' ? 'bg-[#242424] border-[#242424]' : 'bg-white border-[#e6e6e6]'}`}
                  onPress={() => setStoryFilter('Draft')}
                >
                  <Text className={`text-sm font-medium ${storyFilter === 'Draft' ? 'text-white' : 'text-ink'}`}>Drafts</Text>
                </Pressable>
                <Pressable
                  className={`py-2 px-4 rounded-full border ml-3 ${storyFilter === 'Published' ? 'bg-[#242424] border-[#242424]' : 'bg-white border-[#e6e6e6]'}`}
                  onPress={() => setStoryFilter('Published')}
                >
                  <Text className={`text-sm font-medium ${storyFilter === 'Published' ? 'text-white' : 'text-ink'}`}>Published</Text>
                </Pressable>
              </View>

              {storyFilter === 'Draft' ? (
                <View className="items-center justify-center py-10 border border-[#e6e6e6] rounded-xl bg-surface">
                  <Text className="text-base font-bold text-[#242424]">
                    You don't have any draft posts.
                  </Text>
                </View>
              ) : (
                <View className="pb-10">
                  {myPublishedPosts.length > 0 ? (
                    myPublishedPosts.map((post) => (
                      <View key={post.id} className="mb-4">
                        <PostCard post={post} />
                      </View>
                    ))
                  ) : (
                    <View className="items-center justify-center py-10 border border-[#e6e6e6] rounded-xl bg-surface">
                      <Text className="text-base font-bold text-[#242424]">
                        Belum ada artikel yang diterbitkan.
                      </Text>
                      <Pressable
                        className="mt-4 px-5 py-2 bg-[#1a8917] rounded-full"
                        onPress={() => router.push('/editor')}
                      >
                        <Text className="text-white font-medium">Tulis Artikel Pertama</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {activeTab !== 'Stories' && (
            <View className="items-center justify-center py-10">
              <Text className="text-[#6B6B6B] italic">Coming Soon...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
