import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LEVEL_DEFINITIONS, LEVEL_PUZZLES } from '../utils/levels';
import {
  DEFAULT_PROGRESS,
  getGameProgress,
  isWalkthroughCompleted,
  saveGameProgress,
  setWalkthroughCompleted,
} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type CellState = 'empty' | 'x' | 'queen' | 'preplaced';

const WALKTHROUGH_STEPS = [
  {
    message:
      'Welcome to Queens! Place exactly one queen in each row, column, and color region.',
  },
  {
    message:
      "This is your game board. It's a 5\u00d75 grid with 5 color regions. You need to place 5 queens total.",
  },
  {
    message:
      'Some queens are already placed for you. These queens are fixed and cannot be moved.',
  },
  {
    message:
      'Each row and column must have exactly one queen. No two queens can share the same row or column.',
  },
  {
    message:
      'Two queens cannot touch each other, not even diagonally. Keep them at least one cell apart!',
  },
  {
    message:
      "Tap once to mark \u2715 (where a queen can't go). Tap again to place a queen. Tap a queen to remove it.",
  },
  {
    message:
      "You're all set! The timer will start now. Place your remaining 3 queens to solve the puzzle. Good luck!",
  },
];

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// --- Conflict detection (LinkedIn Queens rules) ---
function getConflicts(
  board: CellState[][],
  boardSize: number,
  regionMap: number[][]
): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(false)
  );

  // Collect all queen positions
  const queens: { row: number; col: number }[] = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 'queen' || board[r][c] === 'preplaced') {
        queens.push({ row: r, col: c });
      }
    }
  }

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const a = queens[i];
      const b = queens[j];
      const sameRow = a.row === b.row;
      const sameCol = a.col === b.col;
      const sameRegion = regionMap[a.row][a.col] === regionMap[b.row][b.col];
      const adjacent =
        Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1;

      if (sameRow || sameCol || sameRegion || adjacent) {
        conflicts[a.row][a.col] = true;
        conflicts[b.row][b.col] = true;
      }
    }
  }

  return conflicts;
}

function countQueens(board: CellState[][], boardSize: number): number {
  let count = 0;
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 'queen' || board[r][c] === 'preplaced') count++;
    }
  }
  return count;
}

function hasNoConflicts(conflicts: boolean[][], boardSize: number): boolean {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (conflicts[r][c]) return false;
    }
  }
  return true;
}

// Darken a hex color by a factor (0-1, where 0 = same, 1 = black)
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}

export default function GameScreen({ navigation, route }: Props) {
  const levelNum = route.params.level;
  const levelDef = LEVEL_DEFINITIONS.find((l) => l.level === levelNum)!;
  const puzzle = LEVEL_PUZZLES[levelNum];
  const { boardSize, numQueens } = levelDef;

  const [board, setBoard] = useState<CellState[][]>([]);
  const [conflicts, setConflicts] = useState<boolean[][]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerSecondsRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);
  const completedRef = useRef(false);

  // Initialize board
  const initBoard = useCallback(() => {
    const newBoard: CellState[][] = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill('empty') as CellState[]
    );

    if (puzzle) {
      for (const pos of puzzle.prePlacedPositions) {
        newBoard[pos.row][pos.col] = 'preplaced';
      }
    }

    setBoard(newBoard);
    setConflicts(
      Array.from({ length: boardSize }, () => Array(boardSize).fill(false))
    );
    setTimerSeconds(0);
    timerSecondsRef.current = 0;
    setShowCompletion(false);
    completedRef.current = false;
  }, [boardSize, puzzle]);

  // Load walkthrough state and initialize
  useEffect(() => {
    initBoard();

    if (levelNum === 1) {
      isWalkthroughCompleted().then((completed) => {
        if (!completed) {
          setShowWalkthrough(true);
          setWalkthroughStep(0);
        } else {
          startTimer();
        }
      });
    } else {
      startTimer();
    }

    return () => stopTimer();
  }, [levelNum, initBoard]);

  // Load best time
  useEffect(() => {
    getGameProgress().then((progress) => {
      const p = progress ?? DEFAULT_PROGRESS;
      const levelData = p.levels[String(levelNum)];
      if (levelData?.bestTime != null) {
        setBestTime(levelData.bestTime);
      }
    });
  }, [levelNum]);

  // Handle app state changes for timer pause/resume
  useFocusEffect(
    useCallback(() => {
      const subscription = AppState.addEventListener('change', (nextState) => {
        if (
          appStateRef.current === 'active' &&
          nextState.match(/inactive|background/)
        ) {
          stopTimer();
        } else if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          if (!completedRef.current && !showWalkthrough) {
            startTimer();
          }
        }
        appStateRef.current = nextState;
      });

      return () => {
        subscription.remove();
      };
    }, [showWalkthrough])
  );

  // Pause timer when navigating away, resume on focus
  useFocusEffect(
    useCallback(() => {
      if (!completedRef.current && !showWalkthrough) {
        startTimer();
      }
      return () => stopTimer();
    }, [showWalkthrough])
  );

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      timerSecondsRef.current += 1;
      setTimerSeconds(timerSecondsRef.current);
    }, 1000);
    setTimerRunning(true);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  }

  function handleWalkthroughNext() {
    const nextStep = walkthroughStep + 1;

    if (nextStep >= WALKTHROUGH_STEPS.length) {
      setShowWalkthrough(false);
      setWalkthroughCompleted();
      startTimer();
    } else {
      setWalkthroughStep(nextStep);
    }
  }

  function handleCellPress(row: number, col: number) {
    if (showWalkthrough || showCompletion) return;
    if (!puzzle) return;
    if (board[row][col] === 'preplaced') return;

    const newBoard = board.map((r) => [...r]);

    // Tap cycle: empty → x → queen → empty
    if (newBoard[row][col] === 'empty') {
      newBoard[row][col] = 'x';
    } else if (newBoard[row][col] === 'x') {
      newBoard[row][col] = 'queen';
    } else if (newBoard[row][col] === 'queen') {
      newBoard[row][col] = 'empty';
    }

    setBoard(newBoard);

    const newConflicts = getConflicts(newBoard, boardSize, puzzle.regionMap);
    setConflicts(newConflicts);

    // Check win condition
    const queenCount = countQueens(newBoard, boardSize);
    if (queenCount === numQueens && hasNoConflicts(newConflicts, boardSize)) {
      handleLevelComplete();
    }
  }

  async function handleLevelComplete() {
    completedRef.current = true;
    stopTimer();

    const finalTime = timerSecondsRef.current;
    setCompletionTime(finalTime);

    const progress = (await getGameProgress()) ?? { ...DEFAULT_PROGRESS };

    const levelData = progress.levels[String(levelNum)] ?? {
      unlocked: true,
      completed: false,
      bestTime: null,
      lastPlayedTime: null,
    };

    const previousBest = levelData.bestTime;
    const newBest = previousBest === null || finalTime < previousBest;

    levelData.completed = true;
    levelData.lastPlayedTime = finalTime;

    if (newBest) {
      levelData.bestTime = finalTime;
    }

    progress.levels[String(levelNum)] = levelData;

    // Unlock next level
    const nextLevelKey = String(levelNum + 1);
    if (progress.levels[nextLevelKey]) {
      progress.levels[nextLevelKey].unlocked = true;
    }

    if (levelNum >= progress.currentLevel) {
      progress.currentLevel = Math.min(levelNum + 1, 10);
    }

    await saveGameProgress(progress);

    setBestTime(newBest ? finalTime : previousBest);
    setIsNewBest(newBest && previousBest !== null);
    setShowCompletion(true);
  }

  function handleReset() {
    initBoard();
    completedRef.current = false;
    stopTimer();
    setTimerSeconds(0);
    timerSecondsRef.current = 0;
    startTimer();
  }

  function handleReplay() {
    setShowCompletion(false);
    handleReset();
  }

  function handleNextLevel() {
    if (levelNum < 10) {
      navigation.replace('Game', { level: levelNum + 1 });
    }
  }

  function handleHome() {
    navigation.navigate('Home');
  }

  // --- Board layout calculations ---
  const screenWidth = Dimensions.get('window').width;
  const boardPadding = 24;
  const outerBorder = 3;
  const cellSize = Math.floor(
    (screenWidth - boardPadding * 2 - outerBorder * 2) / boardSize
  );

  // Get region border widths for a cell
  function getRegionBorders(row: number, col: number) {
    if (!puzzle) return { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 };

    const region = puzzle.regionMap[row][col];
    const thick = 2.5;
    const thin = 0.5;

    return {
      top:
        row === 0 || puzzle.regionMap[row - 1][col] !== region ? thick : thin,
      bottom:
        row === boardSize - 1 || puzzle.regionMap[row + 1][col] !== region
          ? thick
          : thin,
      left:
        col === 0 || puzzle.regionMap[row][col - 1] !== region ? thick : thin,
      right:
        col === boardSize - 1 || puzzle.regionMap[row][col + 1] !== region
          ? thick
          : thin,
    };
  }

  function getCellColor(row: number, col: number, cell: CellState): string {
    if (!puzzle) return '#E8E8E8';

    const regionIdx = puzzle.regionMap[row][col];
    const baseColor = puzzle.regionColors[regionIdx];

    if (cell === 'queen' || cell === 'preplaced') {
      return darkenColor(baseColor, 0.15);
    }

    return baseColor;
  }

  function renderCell(row: number, col: number) {
    const cell = board[row]?.[col] ?? 'empty';
    const isConflict = conflicts[row]?.[col] ?? false;
    const borders = getRegionBorders(row, col);
    const bgColor = getCellColor(row, col, cell);

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          {
            width: cellSize,
            height: cellSize,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: bgColor,
            borderTopWidth: borders.top,
            borderBottomWidth: borders.bottom,
            borderLeftWidth: borders.left,
            borderRightWidth: borders.right,
            borderColor: '#3a3a3a',
          },
          isConflict && {
            backgroundColor: '#FFCCCC',
            borderColor: '#FF4444',
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            borderRightWidth: 2,
          },
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={cell === 'preplaced' ? 1 : 0.6}
        disabled={showWalkthrough || showCompletion}
      >
        {cell === 'x' && <Text style={styles.xMark}>{'\u2715'}</Text>}
        {cell === 'preplaced' && (
          <Text style={styles.queenIcon}>{'\u265B'}</Text>
        )}
        {cell === 'queen' && (
          <Text
            style={[styles.queenIcon, isConflict && styles.queenConflict]}
          >
            {'\u265B'}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  function renderBoard() {
    return (
      <View
        style={[
          styles.boardOuter,
          {
            borderWidth: outerBorder,
            borderColor: '#3a3a3a',
            borderRadius: 6,
            overflow: 'hidden',
          },
        ]}
      >
        {Array.from({ length: boardSize }).map((_, row) => (
          <View key={row} style={styles.boardRow}>
            {Array.from({ length: boardSize }).map((_, col) =>
              renderCell(row, col)
            )}
          </View>
        ))}
      </View>
    );
  }

  // --- Region color legend ---
  function renderLegend() {
    if (!puzzle) return null;

    return (
      <View style={styles.legend}>
        {puzzle.regionColors.map((color, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: color }]} />
          </View>
        ))}
      </View>
    );
  }

  function renderWalkthrough() {
    if (!showWalkthrough) return null;

    const step = WALKTHROUGH_STEPS[walkthroughStep];
    const stepNum = walkthroughStep + 1;
    const totalSteps = WALKTHROUGH_STEPS.length;

    return (
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleWalkthroughNext}
      >
        <View style={styles.walkthroughCard}>
          <Text style={styles.walkthroughStepLabel}>
            Step {stepNum} of {totalSteps}
          </Text>
          <Text style={styles.walkthroughMessage}>{step.message}</Text>
          <TouchableOpacity
            style={styles.walkthroughButton}
            onPress={handleWalkthroughNext}
          >
            <Text style={styles.walkthroughButtonText}>
              {walkthroughStep < totalSteps - 1 ? 'Next' : "Let's Go!"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  function renderCompletion() {
    if (!showCompletion) return null;

    return (
      <View style={styles.overlay}>
        <View style={styles.completionCard}>
          <Text style={styles.completionTitle}>Level Complete!</Text>
          <Text style={styles.completionTime}>
            Time: {formatTimer(completionTime)}
          </Text>
          {bestTime !== null && (
            <Text style={styles.completionBest}>
              Best: {formatTimer(bestTime)}
            </Text>
          )}
          {isNewBest && <Text style={styles.newBestBadge}>New Best!</Text>}

          <View style={styles.completionButtons}>
            {levelNum < 10 && (
              <TouchableOpacity
                style={[styles.cBtn, styles.cBtnPrimary]}
                onPress={handleNextLevel}
              >
                <Text style={styles.cBtnPrimaryText}>Next Level</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.cBtn, styles.cBtnSecondary]}
              onPress={handleReplay}
            >
              <Text style={styles.cBtnSecondaryText}>Replay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cBtn, styles.cBtnSecondary]}
              onPress={handleHome}
            >
              <Text style={styles.cBtnSecondaryText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.levelTitle}>Level {levelNum}</Text>
          <Text style={styles.levelSubtitle}>
            {levelDef.boardSize}&times;{levelDef.boardSize} &middot;{' '}
            {levelDef.difficulty}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerIcon}>{'\u23F1'}</Text>
          <Text style={styles.timer}>{formatTimer(timerSeconds)}</Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardContainer}>
        {renderBoard()}
        {renderLegend()}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={showWalkthrough || showCompletion}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Overlays */}
      {renderWalkthrough()}
      {renderCompletion()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    paddingTop: 50,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  levelTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: '700',
  },
  levelSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  timerIcon: {
    fontSize: 14,
  },
  timer: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // --- Board ---
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  boardOuter: {},
  boardRow: {
    flexDirection: 'row',
  },
  xMark: {
    fontSize: 16,
    color: '#555',
    fontWeight: '700',
  },
  queenIcon: {
    fontSize: 26,
    color: '#333',
  },
  queenConflict: {
    color: '#CC0000',
  },
  // --- Legend ---
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  // --- Footer ---
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resetText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
  },
  // --- Overlays ---
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Walkthrough
  walkthroughCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  walkthroughStepLabel: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  walkthroughMessage: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  walkthroughButton: {
    backgroundColor: '#5EB5E0',
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 24,
  },
  walkthroughButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Completion
  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '85%',
  },
  completionTitle: {
    color: '#4CAF50',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  completionTime: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  completionBest: {
    color: '#888',
    fontSize: 16,
    marginBottom: 6,
  },
  newBestBadge: {
    color: '#F4845F',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  completionButtons: {
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  cBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  cBtnPrimary: {
    backgroundColor: '#5EB5E0',
  },
  cBtnSecondary: {
    backgroundColor: '#F0F0F0',
  },
  cBtnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cBtnSecondaryText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
});
