import { memo } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MarkupText } from './MarkupText';
import type { Paragraph } from '../../types/post.types';
import { Ionicons } from '@expo/vector-icons';

interface ParagraphRendererProps {
  paragraph: Paragraph;
  index: number;
}

function ParagraphRendererComponent({ paragraph, index }: ParagraphRendererProps) {
  const { type, text = '', markups = [], metadata = {} } = paragraph;

  // Wrap content in Animated.View for staggered fade-in effect
  const renderContent = () => {
    switch (type) {
      case 'H1':
        return (
          <Text className="text-xl font-bold text-ink mt-6 mb-3 leading-tight font-serif">
            <MarkupText text={text} markups={markups} />
          </Text>
        );

      case 'H2':
        return (
          <Text className="text-lg font-semibold text-ink mt-5 mb-2 leading-tight font-serif">
            <MarkupText text={text} markups={markups} />
          </Text>
        );

      case 'P':
        return (
          <View className="my-2">
            <MarkupText
              text={text}
              markups={markups}
              className="text-[15px] text-ink leading-7 font-serif"
            />
          </View>
        );

      case 'BQ1':
        return (
          <View className="border-l-4 border-primary-500 pl-4 my-4 bg-surface-secondary py-2 rounded-r-sm">
            <MarkupText
              text={text}
              markups={markups}
              className="text-[15px] italic text-ink-secondary leading-6 font-serif"
            />
          </View>
        );

      case 'BQ2':
        return (
          <View className="border-l-4 border-surface-tertiary pl-4 my-4">
            <MarkupText
              text={text}
              markups={markups}
              className="text-[15px] text-ink-tertiary leading-6 font-serif"
            />
          </View>
        );

      case 'PRE':
        return (
          <View className="my-4 p-4 rounded-lg bg-[#272822]">
            <Text className="text-sm font-mono text-[#f8f8f2] leading-5">
              {text}
            </Text>
          </View>
        );

      case 'IMG':
        return (
          <View className="my-6">
            <Image
              source={{ uri: metadata.src }}
              alt={metadata.alt || 'Post image'}
              className="w-full aspect-video rounded-xl bg-surface-tertiary"
              contentFit="cover"
              transition={200}
            />
            {metadata.caption && (
              <Text className="text-sm text-ink-faint text-center mt-2 px-4">
                {metadata.caption}
              </Text>
            )}
          </View>
        );

      case 'OLI':
        return (
          <View className="flex-row my-1.5 pl-2">
            <Text className="text-base text-ink font-semibold mr-2">{index + 1}.</Text>
            <View className="flex-1">
              <MarkupText text={text} markups={markups} className="text-base text-ink leading-6" />
            </View>
          </View>
        );

      case 'ULI':
        return (
          <View className="flex-row my-1.5 pl-2">
            <Text className="text-base text-ink mr-2.5">•</Text>
            <View className="flex-1">
              <MarkupText text={text} markups={markups} className="text-base text-ink leading-6 font-serif" />
            </View>
          </View>
        );

      case 'link':
        return (
          <View className="my-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
            <View className="flex-row items-center">
              <Ionicons name="link-outline" size={20} color="#0891b2" />
              <Text
                numberOfLines={1}
                className="ml-2 text-primary-700 font-medium flex-1 underline"
              >
                {text}
              </Text>
            </View>
          </View>
        );

      case 'HR':
        return <View className="h-[1px] bg-surface-tertiary my-8 mx-12" />;

      default:
        return null;
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
      {renderContent()}
    </Animated.View>
  );
}

export const ParagraphRenderer = memo(ParagraphRendererComponent);
