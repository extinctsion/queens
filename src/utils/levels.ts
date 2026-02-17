export interface LevelDefinition {
  level: number;
  boardSize: number;
  numQueens: number;
  prePlacedQueens: number;
  difficulty: string;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, boardSize: 5, numQueens: 5, prePlacedQueens: 2, difficulty: 'Tutorial' },
  { level: 2, boardSize: 5, numQueens: 5, prePlacedQueens: 1, difficulty: 'Easy' },
  { level: 3, boardSize: 6, numQueens: 6, prePlacedQueens: 2, difficulty: 'Easy' },
  { level: 4, boardSize: 6, numQueens: 6, prePlacedQueens: 1, difficulty: 'Medium' },
  { level: 5, boardSize: 7, numQueens: 7, prePlacedQueens: 2, difficulty: 'Medium' },
  { level: 6, boardSize: 7, numQueens: 7, prePlacedQueens: 1, difficulty: 'Medium-Hard' },
  { level: 7, boardSize: 8, numQueens: 8, prePlacedQueens: 2, difficulty: 'Hard' },
  { level: 8, boardSize: 8, numQueens: 8, prePlacedQueens: 1, difficulty: 'Hard' },
  { level: 9, boardSize: 8, numQueens: 8, prePlacedQueens: 0, difficulty: 'Expert' },
  { level: 10, boardSize: 8, numQueens: 8, prePlacedQueens: 0, difficulty: 'Expert' },
];

// --- Puzzle data for Queens (LinkedIn-style) ---

export interface Position {
  row: number;
  col: number;
}

export interface LevelPuzzle {
  regionMap: number[][];
  regionColors: string[];
  solution: Position[];
  prePlacedPositions: Position[];
}

// Level 1: 5×5 board, 5 regions, 2 pre-placed queens
// Solution: (0,3), (1,0), (2,2), (3,4), (4,1)
// Verified unique with pre-placed (0,3) and (3,4)
export const LEVEL_PUZZLES: Record<number, LevelPuzzle> = {
  1: {
    regionMap: [
      [1, 1, 1, 0, 0],
      [1, 2, 2, 0, 0],
      [2, 2, 2, 3, 3],
      [4, 4, 2, 3, 3],
      [4, 4, 4, 3, 3],
    ],
    regionColors: [
      '#F4845F', // region 0 — coral/orange
      '#C3A6D8', // region 1 — lavender/purple
      '#7BC67E', // region 2 — green
      '#5EB5E0', // region 3 — blue
      '#F2A5B3', // region 4 — pink
    ],
    solution: [
      { row: 0, col: 3 },
      { row: 1, col: 0 },
      { row: 2, col: 2 },
      { row: 3, col: 4 },
      { row: 4, col: 1 },
    ],
    prePlacedPositions: [
      { row: 0, col: 3 },
      { row: 3, col: 4 },
    ],
  },
};
