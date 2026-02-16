import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LevelsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Levels</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
  },
});
