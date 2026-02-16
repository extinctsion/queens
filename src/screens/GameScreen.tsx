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
import { LEVEL_DEFINITIONS } from '../utils/levels';
import {
  DEFAULT_PROGRESS,
  getGameProgress,
  isWalkthroughCompleted,
  saveGameProgress,
  setWalkthroughCompleted,
} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type CellState = 'empty' | 'preplaced' | 'player';

interface Position {
  row: number;
  col: number;
}

// Pre-placed queen positions for Level 1 (valid 5-queens solution: (0,0),(1,2),(2,4),(3,1),(4,3))
const LEVEL1_PREPLACED: Position[] = [
  { row: 0, col: 0 },
  { row: 1, col: 2 },
];

const WALKTHROUGH_STEPS = [
  {
    message:
      'Welcome to Queens! Your goal is to place queens on the board so that no two queens can attack each other.',
  },
  {
    message:
      "This is your game board. It's a 5×5 grid. You need to place 5 queens total.",
  },
  {
    message:
      'Some queens are already placed for you. These gray queens are fixed and cannot be moved.',
  },
  {
    message:
      'A queen attacks everything in its row and column. No two queens can share the same row or column.',
  },
  {
    message:
      'A queen also attacks along both diagonals. No two queens can share a diagonal.',
  },
  {
    message:
      'Tap any empty cell to place a queen. Tap a placed queen to remove it. Try to place all 5 queens without conflicts!',
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

function getConflicts(board: CellState[][], boardSize: number): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(false)
  );

  const queens: Position[] = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] !== 'empty') {
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
      const sameDiag = Math.abs(a.row - b.row) === Math.abs(a.col - b.col);

      if (sameRow || sameCol || sameDiag) {
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
      if (board[r][c] !== 'empty') count++;
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

export default function GameScreen({ navigation, route }: Props) {
  const levelNum = route.params.level;
  const levelDef = LEVEL_DEFINITIONS.find((l) => l.level === levelNum)!;
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
  const [highlightRow, setHighlightRow] = useState<number | null>(null);
  const [highlightCol, setHighlightCol] = useState<number | null>(null);
  const [highlightDiags, setHighlightDiags] = useState(false);
  const [pulseCell, setPulseCell] = useState<Position | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerSecondsRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);
  const completedRef = useRef(false);

  // Initialize board
  const initBoard = useCallback(() => {
    const newBoard: CellState[][] = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill('empty')
    );

    if (levelNum === 1) {
      for (const pos of LEVEL1_PREPLACED) {
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
  }, [boardSize, levelNum]);

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
          // Going to background - pause timer
          stopTimer();
        } else if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // Coming back - resume timer if not completed
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

  // Pause timer when navigating away
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

    // Clear highlights from previous step
    setHighlightRow(null);
    setHighlightCol(null);
    setHighlightDiags(false);
    setPulseCell(null);

    if (nextStep >= WALKTHROUGH_STEPS.length) {
      // Walkthrough complete
      setShowWalkthrough(false);
      setWalkthroughCompleted();
      startTimer();
    } else {
      setWalkthroughStep(nextStep);

      // Set highlights for specific steps
      if (nextStep === 3) {
        // Step 4: highlight row & column of first pre-placed queen
        setHighlightRow(LEVEL1_PREPLACED[0].row);
        setHighlightCol(LEVEL1_PREPLACED[0].col);
      } else if (nextStep === 4) {
        // Step 5: highlight diagonals of first pre-placed queen
        setHighlightRow(null);
        setHighlightCol(null);
        setHighlightDiags(true);
      } else if (nextStep === 5) {
        // Step 6: pulse an empty cell
        setPulseCell({ row: 2, col: 4 });
      }
    }
  }

  function handleCellPress(row: number, col: number) {
    if (showWalkthrough || showCompletion) return;
    if (board[row][col] === 'preplaced') return;

    const newBoard = board.map((r) => [...r]);

    if (newBoard[row][col] === 'player') {
      newBoard[row][col] = 'empty';
    } else {
      newBoard[row][col] = 'player';
    }

    setBoard(newBoard);

    const newConflicts = getConflicts(newBoard, boardSize);
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
    const newBest =
      previousBest === null || finalTime < previousBest;

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

    // Update current level
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
    initBoard();
    completedRef.current = false;
    stopTimer();
    setTimerSeconds(0);
    timerSecondsRef.current = 0;
    startTimer();
  }

  function handleNextLevel() {
    if (levelNum < 10) {
      navigation.replace('Game', { level: levelNum + 1 });
    }
  }

  function handleHome() {
    navigation.navigate('Home');
  }

  // Calculate cell size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const boardPadding = 32;
  const cellGap = 2;
  const totalGaps = (boardSize - 1) * cellGap;
  const cellSize = Math.floor(
    (screenWidth - boardPadding * 2 - totalGaps) / boardSize
  );

  // Check if a cell is on the diagonal of the first pre-placed queen (for walkthrough step 5)
  function isOnDiagonal(row: number, col: number): boolean {
    if (!highlightDiags) return false;
    const qr = LEVEL1_PREPLACED[0].row;
    const qc = LEVEL1_PREPLACED[0].col;
    return (
      Math.abs(row - qr) === Math.abs(col - qc) && (row !== qr || col !== qc)
    );
  }

  function renderCell(row: number, col: number) {
    const cell = board[row]?.[col] ?? 'empty';
    const isConflict = conflicts[row]?.[col] ?? false;
    const isHighlightedRow = highlightRow === row;
    const isHighlightedCol = highlightCol === col;
    const isDiag = isOnDiagonal(row, col);
    const isPulse =
      pulseCell && pulseCell.row === row && pulseCell.col === col;

    const isAttackHighlight = isHighlightedRow || isHighlightedCol || isDiag;
    // Don't highlight the queen cell itself
    const isQueenCell =
      highlightRow !== null &&
      highlightCol !== null &&
      row === highlightRow &&
      col === highlightCol;
    const showAttack = isAttackHighlight && !isQueenCell;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
          },
          cell === 'empty' && styles.cellEmpty,
          cell === 'preplaced' && styles.cellPreplaced,
          cell === 'player' && styles.cellPlayer,
          isConflict && styles.cellConflict,
          showAttack && styles.cellAttack,
          isDiag && cell === 'empty' && styles.cellAttack,
          isPulse && styles.cellPulse,
        ]}
        onPress={() => handleCellPress(row, col)}
        activeOpacity={cell === 'preplaced' ? 1 : 0.6}
        disabled={showWalkthrough || showCompletion}
      >
        {cell === 'preplaced' && (
          <Text style={[styles.queenIcon, styles.queenPreplaced]}>
            {'\u265B'}
          </Text>
        )}
        {cell === 'player' && (
          <Text
            style={[
              styles.queenIcon,
              styles.queenPlayer,
              isConflict && styles.queenConflict,
            ]}
          >
            {'\u265B'}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  function renderBoard() {
    return (
      <View style={styles.board}>
        {Array.from({ length: boardSize }).map((_, row) => (
          <View key={row} style={[styles.boardRow, { gap: cellGap }]}>
            {Array.from({ length: boardSize }).map((_, col) =>
              renderCell(row, col)
            )}
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
        style={styles.walkthroughOverlay}
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
      <View style={styles.completionOverlay}>
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
                style={[styles.completionBtn, styles.completionBtnPrimary]}
                onPress={handleNextLevel}
              >
                <Text style={styles.completionBtnTextPrimary}>
                  Next Level
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.completionBtn, styles.completionBtnSecondary]}
              onPress={handleReplay}
            >
              <Text style={styles.completionBtnTextSecondary}>Replay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.completionBtn, styles.completionBtnSecondary]}
              onPress={handleHome}
            >
              <Text style={styles.completionBtnTextSecondary}>Home</Text>
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
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.levelTitle}>Level {levelNum}</Text>
        <Text style={styles.timer}>{formatTimer(timerSeconds)}</Text>
      </View>

      {/* Board */}
      <View style={styles.boardContainer}>{renderBoard()}</View>

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
  levelTitle: {
    color: '#e2b714',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  timer: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 70,
    textAlign: 'right',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    gap: 2,
  },
  boardRow: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  cellEmpty: {
    backgroundColor: '#16213e',
  },
  cellPreplaced: {
    backgroundColor: '#2a2a4a',
  },
  cellPlayer: {
    backgroundColor: '#1a3a5c',
  },
  cellConflict: {
    backgroundColor: '#5c1a1a',
    borderColor: '#ff4444',
  },
  cellAttack: {
    backgroundColor: '#3d1a1a',
    borderColor: '#773333',
  },
  cellPulse: {
    backgroundColor: '#2a3a1a',
    borderColor: '#e2b714',
    borderWidth: 2,
  },
  queenIcon: {
    fontSize: 24,
  },
  queenPreplaced: {
    color: '#888',
  },
  queenPlayer: {
    color: '#e2b714',
  },
  queenConflict: {
    color: '#ff4444',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  resetText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  // Walkthrough overlay
  walkthroughOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  walkthroughCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 28,
    marginHorizontal: 32,
    borderWidth: 1,
    borderColor: '#e2b714',
    alignItems: 'center',
  },
  walkthroughStepLabel: {
    color: '#8a8a9a',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  walkthroughMessage: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  walkthroughButton: {
    backgroundColor: '#e2b714',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  walkthroughButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
  // Completion overlay
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  completionCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 32,
    borderWidth: 2,
    borderColor: '#4ecca3',
    alignItems: 'center',
    width: '85%',
  },
  completionTitle: {
    color: '#4ecca3',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  completionTime: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  completionBest: {
    color: '#8a8a9a',
    fontSize: 16,
    marginBottom: 8,
  },
  newBestBadge: {
    color: '#e2b714',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  completionButtons: {
    marginTop: 20,
    gap: 12,
    width: '100%',
  },
  completionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completionBtnPrimary: {
    backgroundColor: '#e2b714',
  },
  completionBtnSecondary: {
    backgroundColor: '#2a2a4a',
    borderWidth: 1,
    borderColor: '#3a3a5a',
  },
  completionBtnTextPrimary: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
  completionBtnTextSecondary: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
});
