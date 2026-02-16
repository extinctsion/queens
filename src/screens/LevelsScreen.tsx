import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  DEFAULT_PROGRESS,
  getGameProgress,
  type GameProgress,
  type LevelData,
} from '../utils/storage';
import { LEVEL_DEFINITIONS, type LevelDefinition } from '../utils/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

type LevelState = 'locked' | 'unlocked' | 'completed';

function getLevelState(levelData: LevelData | undefined): LevelState {
  if (!levelData || !levelData.unlocked) return 'locked';
  if (levelData.completed) return 'completed';
  return 'unlocked';
}

function formatTime(totalSecs: number): string {
  const totalSeconds = Math.floor(totalSecs);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function StatusIcon({ state }: { state: LevelState }) {
  if (state === 'locked') {
    return <Text style={styles.statusIcon}>&#x1F512;</Text>;
  }
  if (state === 'completed') {
    return <Text style={[styles.statusIcon, styles.completedIcon]}>&#x2714;</Text>;
  }
  return <Text style={[styles.statusIcon, styles.playIcon]}>&#x25B6;</Text>;
}

export default function LevelsScreen({ navigation, route }: Props) {
  const [progress, setProgress] = useState<GameProgress>(DEFAULT_PROGRESS);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  async function loadProgress() {
    const fromNewGame = route.params?.fromNewGame ?? false;
    if (fromNewGame) {
      setProgress(DEFAULT_PROGRESS);
      // Clear the param so re-focusing doesn't re-reset
      navigation.setParams({ fromNewGame: false });
    } else {
      const saved = await getGameProgress();
      setProgress(saved ?? DEFAULT_PROGRESS);
    }
  }

  function handleLevelPress(levelDef: LevelDefinition) {
    const levelData = progress.levels[String(levelDef.level)];
    const state = getLevelState(levelData);
    if (state === 'locked') return;
    navigation.navigate('Game', { level: levelDef.level });
  }

  function renderLevelTile({ item }: { item: LevelDefinition }) {
    const levelData = progress.levels[String(item.level)];
    const state = getLevelState(levelData);

    return (
      <TouchableOpacity
        style={[
          styles.tile,
          state === 'locked' && styles.tileLocked,
          state === 'unlocked' && styles.tileUnlocked,
          state === 'completed' && styles.tileCompleted,
        ]}
        onPress={() => handleLevelPress(item)}
        disabled={state === 'locked'}
        activeOpacity={0.7}
      >
        <View style={styles.tileHeader}>
          <Text
            style={[
              styles.levelNumber,
              state === 'locked' && styles.textLocked,
            ]}
          >
            Level {item.level}
          </Text>
          <StatusIcon state={state} />
        </View>

        <Text
          style={[
            styles.boardSize,
            state === 'locked' && styles.textLocked,
          ]}
        >
          {item.boardSize}&times;{item.boardSize}
        </Text>

        <Text
          style={[
            styles.difficulty,
            state === 'locked' && styles.textLocked,
          ]}
        >
          {item.difficulty}
        </Text>

        {state === 'completed' && levelData?.bestTime != null && (
          <Text style={styles.bestTime}>
            Best: {formatTime(levelData.bestTime)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>&#x2190; Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Level</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={LEVEL_DEFINITIONS}
        renderItem={renderLevelTile}
        keyExtractor={(item) => String(item.level)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 70,
  },
  backText: {
    color: '#e2b714',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#e2b714',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 130,
    justifyContent: 'center',
  },
  tileLocked: {
    opacity: 0.4,
    borderColor: '#333',
  },
  tileUnlocked: {
    borderColor: '#e2b714',
    shadowColor: '#e2b714',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  tileCompleted: {
    borderColor: '#4ecca3',
    backgroundColor: '#16213e',
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  levelNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusIcon: {
    fontSize: 14,
    color: '#888',
  },
  completedIcon: {
    color: '#4ecca3',
  },
  playIcon: {
    color: '#e2b714',
  },
  boardSize: {
    color: '#ccc',
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 4,
  },
  difficulty: {
    color: '#8a8a9a',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  bestTime: {
    color: '#4ecca3',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  textLocked: {
    color: '#555',
  },
});
