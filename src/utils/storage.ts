import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'game_progress';

export interface LevelData {
  unlocked: boolean;
  completed: boolean;
  bestTime: number | null;
}

export interface GameProgress {
  currentLevel: number;
  levels: Record<string, LevelData>;
}

export const DEFAULT_PROGRESS: GameProgress = {
  currentLevel: 1,
  levels: {
    '1': { unlocked: true, completed: false, bestTime: null },
    '2': { unlocked: false, completed: false, bestTime: null },
    '3': { unlocked: false, completed: false, bestTime: null },
    '4': { unlocked: false, completed: false, bestTime: null },
    '5': { unlocked: false, completed: false, bestTime: null },
    '6': { unlocked: false, completed: false, bestTime: null },
    '7': { unlocked: false, completed: false, bestTime: null },
    '8': { unlocked: false, completed: false, bestTime: null },
    '9': { unlocked: false, completed: false, bestTime: null },
    '10': { unlocked: false, completed: false, bestTime: null },
  },
};

export async function getGameProgress(): Promise<GameProgress | null> {
  const data = await AsyncStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data) : null;
}

export async function saveGameProgress(progress: GameProgress): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function clearGameProgress(): Promise<void> {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}

export function hasPlayerProgress(progress: GameProgress | null): boolean {
  if (!progress) return false;
  return Object.values(progress.levels).some(
    (level) => level.completed || (level.unlocked && level !== progress.levels['1'])
  );
}
