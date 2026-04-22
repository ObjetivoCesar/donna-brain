import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface ProgressBarProps {
  progress: number; // A value between 0 and 1
}

const ProgressBar = ({ progress }: ProgressBarProps) => {
  const progressPercentage = Math.max(0, Math.min(100, progress * 100));

  return (
    <View style={styles.container}>
      <ThemedText style={styles.progressText}>{`${Math.round(progressPercentage)}% completado`}</ThemedText>
      <View style={styles.bar}>
        <View style={[styles.progress, { width: `${progressPercentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bar: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0de',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
});

export default ProgressBar;
