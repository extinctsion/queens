# Level 1 - Walkthrough & Timer - Queens Game

## Overview
Level 1 serves as the tutorial level. When the player starts this level for the first time, a step-by-step walkthrough explains the rules and mechanics of the game. After the walkthrough is complete, the timer starts and the player can begin placing queens. On completion, the time is recorded.

## Level 1 Configuration
- **Board size**: 5×5
- **Total queens required**: 5
- **Pre-placed queens**: 2 (fixed on the board, cannot be moved)
- **Queens for player to place**: 3

## Walkthrough Flow

The walkthrough is a sequence of overlay/modal steps that guide the player. Each step highlights a specific part of the board or UI. The player progresses through steps by tapping "Next" or tapping anywhere on the overlay.

### Step 1: Welcome
- **Message**: "Welcome to Queens! Your goal is to place queens on the board so that no two queens can attack each other."
- **Visual**: Full board is visible but dimmed. Overlay text displayed in center.

### Step 2: The Board
- **Message**: "This is your game board. It's a 5×5 grid. You need to place 5 queens total."
- **Visual**: Board is highlighted. Arrow or focus indicator points to the grid.

### Step 3: Pre-placed Queens
- **Message**: "Some queens are already placed for you. These gray queens are fixed and cannot be moved."
- **Visual**: The 2 pre-placed queens are highlighted with a pulsing animation or spotlight effect.

### Step 4: Attack Rules - Rows & Columns
- **Message**: "A queen attacks everything in its row and column. No two queens can share the same row or column."
- **Visual**: One pre-placed queen is highlighted. Its entire row and column are shaded in red/danger color to show the attack range.

### Step 5: Attack Rules - Diagonals
- **Message**: "A queen also attacks along both diagonals. No two queens can share a diagonal."
- **Visual**: The same queen's diagonal lines are shaded in red/danger color.

### Step 6: Placing a Queen
- **Message**: "Tap any empty cell to place a queen. Tap a placed queen to remove it. Try to place all 5 queens without conflicts!"
- **Visual**: An example empty cell pulses to indicate it can be tapped.

### Step 7: Ready to Play
- **Message**: "You're all set! The timer will start now. Place your remaining 3 queens to solve the puzzle. Good luck!"
- **Visual**: Overlay fades out. Board becomes fully interactive.

## Walkthrough Settings
- The walkthrough only shows on the **first time** Level 1 is played.
- If the player replays Level 1 later, the walkthrough is skipped and the timer starts immediately.
- A flag is stored in AsyncStorage: `"walkthroughCompleted": true`
- The player can access the walkthrough again from Settings (future feature).

## Timer Behavior

### Timer Start
- The timer starts **immediately after the walkthrough ends** (after Step 7 is dismissed).
- If walkthrough was already completed (replay), the timer starts as soon as the level loads.
- Timer is displayed at the top of the game screen in `MM:SS` format.
- Timer counts **up** from `00:00`.

### Timer During Gameplay
- Timer runs continuously while the level is active.
- Timer **pauses** if the player navigates away (presses back, app goes to background).
- Timer **resumes** when the player returns to the level.
- Timer is visible at all times during gameplay.

### Timer Stop & Recording
- Timer stops when the player successfully places all queens with no conflicts.
- The completion time is stored in AsyncStorage under the level's data:

```json
{
  "levels": {
    "1": {
      "unlocked": true,
      "completed": true,
      "bestTime": 45.2,
      "lastPlayedTime": 45.2
    }
  }
}
```

- `bestTime` is stored in **seconds** (with decimal precision).
- If the player replays the level and gets a better time, `bestTime` is updated.
- If the new time is worse, `bestTime` remains unchanged.

## Level Completion Flow

1. Player places the final queen correctly.
2. Game validates the board:
   - Exactly 5 queens on the board (2 pre-placed + 3 player-placed).
   - No two queens share a row, column, or diagonal.
3. If valid:
   - Timer stops.
   - A **completion overlay** appears with:
     - "Level Complete!" message
     - Completion time displayed (e.g., "Time: 00:45")
     - Best time displayed (if this is a replay)
     - "New Best!" badge if the player beat their previous time
     - **Next Level** button (navigates to Level 2)
     - **Replay** button (restarts Level 1)
     - **Home** button (returns to Home Page)
   - Level 1 is marked as completed in AsyncStorage.
   - Level 2 is unlocked in AsyncStorage.
4. If invalid (queens conflict):
   - Conflicting queens are highlighted in red.
   - The game does **not** stop — the player can adjust placements.
   - No popup or interruption; just visual feedback on conflicts.

## Game Screen UI Elements
- **Header**: Level title ("Level 1"), timer (`MM:SS`), back button.
- **Board**: 5×5 grid centered on screen.
  - Empty cells: light color, tappable.
  - Pre-placed queens: gray queen icon, not tappable.
  - Player-placed queens: colored queen icon (e.g., gold/yellow), tappable to remove.
  - Conflict cells: red highlight/border on queens that conflict.
- **Footer**: Reset button (clears all player-placed queens, resets timer).

## Conflict Detection (Real-time)
- After every queen placement or removal, validate the board immediately.
- Highlight any queens that are in conflict (share row, column, or diagonal).
- Remove conflict highlights as soon as the conflict is resolved.
- This provides instant visual feedback to help the player learn.
