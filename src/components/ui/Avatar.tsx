// src/components/ui/Avatar.tsx
// Profile picture component with fallback to first letter of username

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image, type ImageProps } from 'expo-image';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  className?: string;
  containerStyle?: object;
  imageProps?: Partial<ImageProps>;
}

const Avatar = ({
  uri,
  name = '?',
  size = 48,
  className = '',
  containerStyle,
  imageProps,
}: AvatarProps) => {
  const firstLetter = name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  const hasValidUri = uri && typeof uri === 'string' && uri.trim().length > 0;

  // If we have a valid URI, render the image
  if (hasValidUri) {
    return (
      <Image
        source={uri}
        contentFit="cover"
        transition={300}
        style={[{ width: size, height: size, borderRadius: size / 2 }, containerStyle]}
        className={`${className} bg-surface-secondary shadow-sm`}
        {...imageProps}
      />
    );
  }

  // Fallback to first letter with app theme colors
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#4c6ef5', // indigo-600 (app theme)
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        containerStyle,
      ]}
      className={className}
    >
      <Text
        style={{
          color: '#ffffff',
          fontSize: size * 0.45,
          fontWeight: 'bold',
          includeFontPadding: false,
          textAlignVertical: 'center',
        }}
      >
        {firstLetter}
      </Text>
    </View>
  );
};

export default Avatar;
