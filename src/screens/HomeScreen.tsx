import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import {
  DEFAULT_PROGRESS,
  getGameProgress,
  hasPlayerProgress,
  saveGameProgress,
} from '../utils/storage';
import type { RootStackParamList } from '../navigation/AppNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const [hasProgress, setHasProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  async function loadProgress() {
    setLoading(true);
    const progress = await getGameProgress();
    setHasProgress(hasPlayerProgress(progress));
    if (progress) {
      setCurrentLevel(progress.currentLevel);
    }
    setLoading(false);
  }

  function handleContinue() {
    navigation.navigate('Game', { level: currentLevel });
  }

  async function handleNewGame() {
    await saveGameProgress(DEFAULT_PROGRESS);
    navigation.navigate('Levels');
  }

  function handleLevels() {
    navigation.navigate('Levels');
  }

  function handleSettings() {
    navigation.navigate('Settings');
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e2b714" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Queens</Text>
        <Text style={styles.subtitle}>Place your queens wisely</Text>
      </View>

      <View style={styles.buttonSection}>
        {hasProgress && (
          <MenuButton label="Continue" onPress={handleContinue} />
        )}
        <MenuButton label="New Game" onPress={handleNewGame} />
        {hasProgress && (
          <MenuButton label="Levels" onPress={handleLevels} />
        )}
        <MenuButton label="Settings" onPress={handleSettings} />
      </View>
    </View>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#e2b714',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8a8a9a',
    marginTop: 8,
  },
  buttonSection: {
    width: '100%',
    maxWidth: 280,
    gap: 14,
  },
  button: {
    backgroundColor: '#16213e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2b71440',
  },
  buttonText: {
    color: '#e2b714',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
