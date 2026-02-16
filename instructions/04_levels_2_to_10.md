# Levels 2–10: Game Levels PRD - Queens Game

## Overview

After completing Level 1 (the tutorial level), the player progresses through Levels 2–10 with increasing difficulty. Each level introduces a larger board, fewer pre-placed hints, or additional mechanics that challenge the player. Upon completing all 10 levels, a victory screen celebrates the player's achievement.

All level logic should be organized in a **dedicated folder** (e.g., `src/levels/`) with each level's configuration in a separate file for maintainability and readability.

---

## Code Organization

### Recommended File Structure

```
src/
├── levels/
│   ├── index.ts              # Exports all level configs; level registry
│   ├── types.ts              # Shared types/interfaces for level configs
│   ├── level1.ts             # Level 1 configuration
│   ├── level2.ts             # Level 2 configuration
│   ├── level3.ts             # Level 3 configuration
│   ├── level4.ts             # Level 4 configuration
│   ├── level5.ts             # Level 5 configuration
│   ├── level6.ts             # Level 6 configuration
│   ├── level7.ts             # Level 7 configuration
│   ├── level8.ts             # Level 8 configuration
│   ├── level9.ts             # Level 9 configuration
│   └── level10.ts            # Level 10 configuration
├── components/
│   ├── GameBoard.tsx          # Reusable board component (accepts size, config)
│   ├── VictoryScreen.tsx      # "Winner winner chicken dinner" screen
│   └── LevelComplete.tsx      # Per-level completion overlay
├── screens/
│   └── GameScreen.tsx         # Main game screen, loads level config by ID
└── utils/
    └── queenValidation.ts     # Conflict detection algorithm
```

### Level Configuration Interface

Each level file exports a configuration object following this shared interface:

```typescript
// src/levels/types.ts

interface Position {
  row: number;
  col: number;
}

interface LevelConfig {
  id: number;                        // Level number (1–10)
  boardSize: number;                 // N×N board size
  totalQueens: number;               // Number of queens to place (equals boardSize)
  preplacedQueens: Position[];       // Coordinates of pre-placed (fixed) queens
  queensToPlace: number;             // totalQueens - preplacedQueens.length
  difficulty: string;                // Display label: "Tutorial" | "Easy" | "Medium" | "Medium-Hard" | "Hard" | "Expert"
  hints: string[];                   // Optional in-game hint messages for the level
  timeLimit?: number | null;         // Optional time limit in seconds (null = no limit)
  blockedCells?: Position[];         // Optional cells that cannot have queens placed on them
}
```

### Level Registry

```typescript
// src/levels/index.ts

import level1 from './level1';
import level2 from './level2';
// ... etc.
import level10 from './level10';

const levels: Record<number, LevelConfig> = {
  1: level1,
  2: level2,
  // ... etc.
  10: level10,
};

export default levels;
export function getLevelConfig(id: number): LevelConfig { return levels[id]; }
```

---

## Level Definitions

### Level 2 — Easy (5×5, 1 Pre-placed Queen)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 5×5            |
| Total Queens       | 5              |
| Pre-placed Queens  | 1              |
| Queens to Place    | 4              |
| Difficulty         | Easy           |

**Description**: The training wheels come off slightly. Only 1 queen is pre-placed, requiring the player to place 4 queens on a 5×5 board. The smaller board keeps it approachable but the reduced guidance increases challenge.

**Configuration**:
```typescript
// src/levels/level2.ts
const level2: LevelConfig = {
  id: 2,
  boardSize: 5,
  totalQueens: 5,
  preplacedQueens: [{ row: 0, col: 2 }],
  queensToPlace: 4,
  difficulty: "Easy",
  hints: [
    "Start by identifying which rows and columns are already blocked.",
    "Work from corners — they limit fewer cells."
  ],
};
```

**Completion Overlay**:
- "Level 2 Complete!"
- Shows completion time and best time
- Buttons: **Next Level** | **Replay** | **Home**

---

### Level 3 — Easy (6×6, 2 Pre-placed Queens)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 6×6            |
| Total Queens       | 6              |
| Pre-placed Queens  | 2              |
| Queens to Place    | 4              |
| Difficulty         | Easy           |

**Description**: The board expands to 6×6, introducing a larger grid with more possibilities. Two pre-placed queens provide reasonable guidance while the player adjusts to the bigger board.

**Configuration**:
```typescript
// src/levels/level3.ts
const level3: LevelConfig = {
  id: 3,
  boardSize: 6,
  totalQueens: 6,
  preplacedQueens: [{ row: 1, col: 3 }, { row: 4, col: 0 }],
  queensToPlace: 4,
  difficulty: "Easy",
  hints: [
    "A 6×6 board has more open space — think ahead before placing.",
    "Check diagonals carefully on the larger board."
  ],
};
```

---

### Level 4 — Medium (6×6, 1 Pre-placed Queen)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 6×6            |
| Total Queens       | 6              |
| Pre-placed Queens  | 1              |
| Queens to Place    | 5              |
| Difficulty         | Medium         |

**Description**: Same 6×6 board but now with only 1 pre-placed queen. The player must figure out placement for 5 queens, making strategic thinking more important.

**Configuration**:
```typescript
// src/levels/level4.ts
const level4: LevelConfig = {
  id: 4,
  boardSize: 6,
  totalQueens: 6,
  preplacedQueens: [{ row: 0, col: 1 }],
  queensToPlace: 5,
  difficulty: "Medium",
  hints: [
    "With less help, plan your placements before committing.",
    "If you get stuck, try removing queens and starting from a different row."
  ],
};
```

---

### Level 5 — Medium (7×7, 2 Pre-placed Queens)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 7×7            |
| Total Queens       | 7              |
| Pre-placed Queens  | 2              |
| Queens to Place    | 5              |
| Difficulty         | Medium         |

**Description**: The board grows to 7×7. Two pre-placed queens offer some structure, but the increased board size and queen count demand more careful planning. Diagonals become trickier to track visually.

**Configuration**:
```typescript
// src/levels/level5.ts
const level5: LevelConfig = {
  id: 5,
  boardSize: 7,
  totalQueens: 7,
  preplacedQueens: [{ row: 0, col: 3 }, { row: 6, col: 1 }],
  queensToPlace: 5,
  difficulty: "Medium",
  hints: [
    "Diagonals are harder to spot on a 7×7 board — take your time.",
    "Try to place queens in the middle rows first."
  ],
};
```

---

### Level 6 — Medium-Hard (7×7, 1 Pre-placed Queen)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 7×7            |
| Total Queens       | 7              |
| Pre-placed Queens  | 1              |
| Queens to Place    | 6              |
| Difficulty         | Medium-Hard    |

**Description**: A 7×7 board with minimal guidance — only 1 pre-placed queen. The player needs to place 6 queens independently. This is the bridge between medium and hard territory.

**Configuration**:
```typescript
// src/levels/level6.ts
const level6: LevelConfig = {
  id: 6,
  boardSize: 7,
  totalQueens: 7,
  preplacedQueens: [{ row: 2, col: 5 }],
  queensToPlace: 6,
  difficulty: "Medium-Hard",
  hints: [
    "One pre-placed queen means you need a solid strategy.",
    "Consider which cells each placement eliminates before committing."
  ],
};
```

---

### Level 7 — Hard (8×8, 2 Pre-placed Queens)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 8×8            |
| Total Queens       | 8              |
| Pre-placed Queens  | 2              |
| Queens to Place    | 6              |
| Difficulty         | Hard           |

**Description**: The classic 8-queens problem. The board is now full-sized at 8×8. Two pre-placed queens help narrow down solutions, but 6 queens to place on a 64-cell board is a genuine challenge.

**Configuration**:
```typescript
// src/levels/level7.ts
const level7: LevelConfig = {
  id: 7,
  boardSize: 8,
  totalQueens: 8,
  preplacedQueens: [{ row: 0, col: 3 }, { row: 7, col: 4 }],
  queensToPlace: 6,
  difficulty: "Hard",
  hints: [
    "Welcome to the classic 8-Queens! Think systematically.",
    "Try working row by row from the top."
  ],
};
```

---

### Level 8 — Hard (8×8, 1 Pre-placed Queen)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 8×8            |
| Total Queens       | 8              |
| Pre-placed Queens  | 1              |
| Queens to Place    | 7              |
| Difficulty         | Hard           |

**Description**: An 8×8 board with only 1 pre-placed queen. The player is now solving nearly the entire 8-queens problem on their own. Multiple solutions exist, but finding one requires patience and logical deduction.

**Configuration**:
```typescript
// src/levels/level8.ts
const level8: LevelConfig = {
  id: 8,
  boardSize: 8,
  totalQueens: 8,
  preplacedQueens: [{ row: 3, col: 0 }],
  queensToPlace: 7,
  difficulty: "Hard",
  hints: [
    "Almost no help now — trust your instincts and logic.",
    "If stuck, try backtracking: remove the last queen and try a different column."
  ],
};
```

---

### Level 9 — Expert (8×8, No Pre-placed Queens)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 8×8            |
| Total Queens       | 8              |
| Pre-placed Queens  | 0              |
| Queens to Place    | 8              |
| Difficulty         | Expert         |

**Description**: The full 8-queens problem with zero assistance. No pre-placed queens — the player must find one of the 92 possible solutions entirely on their own. This is a true test of the player's mastery.

**Configuration**:
```typescript
// src/levels/level9.ts
const level9: LevelConfig = {
  id: 9,
  boardSize: 8,
  totalQueens: 8,
  preplacedQueens: [],
  queensToPlace: 8,
  difficulty: "Expert",
  hints: [
    "No guidance here — you're on your own!",
    "There are 92 possible solutions. Find any one of them."
  ],
};
```

---

### Level 10 — Expert (8×8, No Pre-placed Queens + Blocked Cells)

| Property           | Value          |
|--------------------|----------------|
| Board Size         | 8×8            |
| Total Queens       | 8              |
| Pre-placed Queens  | 0              |
| Queens to Place    | 8              |
| Blocked Cells      | 4              |
| Difficulty         | Expert         |

**Description**: The ultimate challenge. Same 8×8 board with no pre-placed queens, but now **4 cells are blocked** (marked and unusable). This reduces the number of valid solutions and forces the player to solve a constrained variant of the 8-queens problem. Blocked cells are visually distinct (e.g., darkened/crossed-out) and cannot have queens placed on them.

**Configuration**:
```typescript
// src/levels/level10.ts
const level10: LevelConfig = {
  id: 10,
  boardSize: 8,
  totalQueens: 8,
  preplacedQueens: [],
  queensToPlace: 8,
  difficulty: "Expert",
  blockedCells: [
    { row: 2, col: 2 },
    { row: 2, col: 5 },
    { row: 5, col: 2 },
    { row: 5, col: 5 },
  ],
  hints: [
    "Blocked cells limit your options — plan around them.",
    "This is the final challenge. You've got this!"
  ],
};
```

**Blocked Cells Visual**:
- Blocked cells are shown with an **X mark** or dark shading.
- They are **not tappable** — tapping does nothing.
- They act as permanent obstacles, similar to walls.

---

## Difficulty Progression Summary

| Level | Board | Queens to Place | Pre-placed | Blocked Cells | Difficulty  |
|-------|-------|-----------------|-----------|---------------|-------------|
| 1     | 5×5   | 3               | 2         | 0             | Tutorial    |
| 2     | 5×5   | 4               | 1         | 0             | Easy        |
| 3     | 6×6   | 4               | 2         | 0             | Easy        |
| 4     | 6×6   | 5               | 1         | 0             | Medium      |
| 5     | 7×7   | 5               | 2         | 0             | Medium      |
| 6     | 7×7   | 6               | 1         | 0             | Medium-Hard |
| 7     | 8×8   | 6               | 2         | 0             | Hard        |
| 8     | 8×8   | 7               | 1         | 0             | Hard        |
| 9     | 8×8   | 8               | 0         | 0             | Expert      |
| 10    | 8×8   | 8               | 0         | 4             | Expert      |

---

## Per-Level Completion Flow

This flow is identical for all levels (2–10), building on the behavior defined for Level 1:

1. Player places the final queen correctly.
2. Game validates the board:
   - Exactly N queens on the board (pre-placed + player-placed).
   - No two queens share a row, column, or diagonal.
   - No queen placed on a blocked cell (Level 10).
3. If valid:
   - Timer stops.
   - **Completion overlay** appears with:
     - **"Level N Complete!"** message
     - Completion time (e.g., "Time: 01:23")
     - Best time (if replaying)
     - **"New Best!"** badge if the player improved their time
     - **Next Level** button (for Levels 2–9; navigates to Level N+1)
     - **Replay** button (restarts current level)
     - **Home** button (returns to Home Page)
   - Level N is marked as completed in AsyncStorage.
   - Level N+1 is unlocked in AsyncStorage (for Levels 2–9).
4. If invalid (conflicts exist):
   - Conflicting queens are highlighted in red.
   - No popup — player can freely adjust placements.

---

## Game Victory Screen (After Level 10 Completion)

### Trigger
When the player completes **Level 10** (the final level), the standard level completion overlay is replaced by a special **Victory Screen**.

### Victory Screen Design

**Transition Animation**:
1. Upon completing Level 10, the board briefly flashes with a golden glow.
2. A full-screen overlay transitions in using a **zoom + fade** animation (duration: ~800ms).
3. Confetti particles rain down across the screen (animated, looping for ~5 seconds).

**Screen Content**:

```
┌──────────────────────────────────────┐
│                                      │
│          🎉  CONFETTI EFFECT  🎉     │
│                                      │
│     ╔══════════════════════════╗     │
│     ║                          ║     │
│     ║   Winner Winner          ║     │
│     ║   Chicken Dinner!        ║     │
│     ║                          ║     │
│     ╚══════════════════════════╝     │
│                                      │
│     🏆 All 10 Levels Completed! 🏆   │
│                                      │
│     Total Time: 12:34               │
│     Best Level: Level 2 (00:18)     │
│                                      │
│     ┌────────────────────────┐      │
│     │     🔄 Play Again      │      │
│     └────────────────────────┘      │
│                                      │
│     ┌────────────────────────┐      │
│     │     🏠 Home             │      │
│     └────────────────────────┘      │
│                                      │
└──────────────────────────────────────┘
```

**Victory Screen Elements**:

| Element                    | Description                                                                                         |
|----------------------------|-----------------------------------------------------------------------------------------------------|
| **Title**                  | "Winner Winner Chicken Dinner!" — large, bold text with a golden/trophy color, centered on screen.  |
| **Subtitle**               | "All 10 Levels Completed!" — displayed below the title.                                             |
| **Total Time**             | Sum of the player's best times across all 10 levels, formatted as `MM:SS`.                          |
| **Best Level**             | The level with the fastest best time, displayed as "Level N (MM:SS)".                               |
| **Confetti Animation**     | Colorful confetti particles falling across the screen. Loops for 5 seconds then fades out.          |
| **Play Again Button**      | Resets all progress and navigates to the Levels page with Level 1 unlocked.                         |
| **Home Button**            | Returns to the Home Page with all progress preserved (all levels completed).                        |

### "Play Again" Flow

When the player taps **Play Again** on the victory screen:

1. Show a confirmation dialog: *"This will reset all your progress. Are you sure you want to play again?"*
2. Options: **Yes, Start Over** | **Cancel**
3. If confirmed:
   - Clear all level progress from AsyncStorage.
   - Reset `currentLevel` to 1.
   - All levels reset to locked except Level 1.
   - Navigate to the Levels page.
4. If cancelled:
   - Return to the Victory Screen.

### Victory Screen Data

```json
{
  "gameCompleted": true,
  "totalBestTime": 734.5,
  "bestLevelId": 2,
  "bestLevelTime": 18.3,
  "levels": {
    "1":  { "unlocked": true, "completed": true, "bestTime": 45.2 },
    "2":  { "unlocked": true, "completed": true, "bestTime": 18.3 },
    "3":  { "unlocked": true, "completed": true, "bestTime": 52.1 },
    "4":  { "unlocked": true, "completed": true, "bestTime": 67.8 },
    "5":  { "unlocked": true, "completed": true, "bestTime": 89.0 },
    "6":  { "unlocked": true, "completed": true, "bestTime": 95.4 },
    "7":  { "unlocked": true, "completed": true, "bestTime": 102.3 },
    "8":  { "unlocked": true, "completed": true, "bestTime": 98.7 },
    "9":  { "unlocked": true, "completed": true, "bestTime": 120.5 },
    "10": { "unlocked": true, "completed": true, "bestTime": 145.2 }
  }
}
```

---

## Transition Between Levels

### Level Completion → Next Level

When the player taps **Next Level** on the completion overlay:

1. The completion overlay fades out (~300ms).
2. The current board slides out to the left (~400ms).
3. The next level's board slides in from the right (~400ms).
4. The timer resets to `00:00` and starts counting.
5. Pre-placed queens (if any) appear with a brief drop-in animation.

### Level Completion → Level 10 → Victory Screen

When the player completes Level 10:

1. The board flashes golden (~500ms).
2. A brief pause (~300ms) to let the moment land.
3. The victory screen transitions in with zoom + fade (~800ms).
4. Confetti animation starts immediately on screen entry.

---

## Hint System

Each level includes optional hint messages that the player can access if stuck.

### Hint Behavior
- A **lightbulb icon** is displayed in the header (next to the timer).
- Tapping the icon shows the first hint for the current level as a toast/tooltip.
- Tapping again shows the next hint (cycles through available hints).
- Hints are informational only — they do not reveal queen positions.
- Using hints does **not** affect the player's time or score.

---

## Blocked Cells (Level 10 Mechanic)

### Visual Design
- Blocked cells have a **dark gray background** with a subtle **X pattern** or diagonal stripes.
- They are visually distinct from empty cells and queen cells.
- They do not respond to tap events.

### Validation
- The conflict detection algorithm must skip blocked cells (they can never contain a queen).
- The available cells = total cells − blocked cells − pre-placed queen cells.
- A valid solution must still satisfy all N-queens rules within the remaining cells.

---

## Storage Schema Update

The AsyncStorage schema is extended to support the new features:

```json
{
  "currentLevel": 5,
  "gameCompleted": false,
  "walkthroughCompleted": true,
  "levels": {
    "1": {
      "unlocked": true,
      "completed": true,
      "bestTime": 45.2,
      "lastPlayedTime": 45.2
    },
    "2": {
      "unlocked": true,
      "completed": true,
      "bestTime": 32.1,
      "lastPlayedTime": 38.5
    },
    "3": {
      "unlocked": true,
      "completed": true,
      "bestTime": 58.7,
      "lastPlayedTime": 58.7
    },
    "4": {
      "unlocked": true,
      "completed": true,
      "bestTime": 72.3,
      "lastPlayedTime": 72.3
    },
    "5": {
      "unlocked": true,
      "completed": false,
      "bestTime": null,
      "lastPlayedTime": null
    },
    "6":  { "unlocked": false, "completed": false, "bestTime": null, "lastPlayedTime": null },
    "7":  { "unlocked": false, "completed": false, "bestTime": null, "lastPlayedTime": null },
    "8":  { "unlocked": false, "completed": false, "bestTime": null, "lastPlayedTime": null },
    "9":  { "unlocked": false, "completed": false, "bestTime": null, "lastPlayedTime": null },
    "10": { "unlocked": false, "completed": false, "bestTime": null, "lastPlayedTime": null }
  }
}
```

---

## Edge Cases & Notes

1. **Pre-placed queen positions**: Each level config must have pre-placed queens at positions that allow at least one valid solution. The positions listed above have been chosen to ensure solvability.
2. **Blocked cells (Level 10)**: The 4 blocked cell positions are chosen so that at least one valid 8-queens solution still exists.
3. **Replay**: Replaying any level resets only that level's board — it does not affect progress on other levels.
4. **Back navigation during gameplay**: If the player presses back during an active level, the timer pauses. Returning resumes the timer. No progress is lost.
5. **Victory screen re-access**: If all 10 levels are completed and the player returns to the Levels page, all levels show as completed. Tapping Level 10 again replays it; completing it again shows the victory screen.
6. **Level 10 completion on replay**: If the player already has `gameCompleted: true` and replays Level 10, the victory screen still shows (with updated times if improved).
