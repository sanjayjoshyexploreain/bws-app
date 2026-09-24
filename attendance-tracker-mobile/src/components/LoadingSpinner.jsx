import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingSpinner({ size = "large", color = "#2563eb" }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
