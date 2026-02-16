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
