import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export const HapticTab = ({ children, ...props }: any) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (props.onPress) {
          props.onPress(e);
        }
      }}
    >
      {children}
    </TouchableOpacity>
  );
};
