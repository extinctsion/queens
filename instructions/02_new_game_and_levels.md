# New Game & Levels Page - Queens Game

## Overview
When the player selects **New Game** from the home page, it navigates to the Levels page. This page displays all 10 levels of the game in a grid layout. Level availability depends on how the player arrived at this page.

## Navigation to Levels Page

### Via "New Game" Button
- Resets all game progress (clears saved data from AsyncStorage).
- Only **Level 1** is unlocked and highlighted.
- Levels 2–10 are locked and visually dimmed/grayed out.
- The player must complete levels sequentially starting from Level 1.

### Via "Levels" Button (Returning Player)
- Preserves existing game progress.
- All previously completed levels and the next unlocked level are accessible.
- Completed levels show a checkmark and the player's best completion time.
- The next uncompleted level is highlighted as the active/current level.
- Remaining locked levels are dimmed/grayed out.

## Levels Page Layout

### Grid Display
- Levels are displayed in a grid (e.g., 2 columns × 5 rows or a scrollable list).
- Each level is represented as a card/tile with:
  - **Level number** (1–10)
  - **Board size** indicator (e.g., "5×5", "6×6", etc.)
  - **Status icon**: lock icon (locked), play icon (unlocked), checkmark (completed)
  - **Best time** (shown only for completed levels)

### Level States

| State     | Visual                                      | Interaction         |
|-----------|---------------------------------------------|---------------------|
| Locked    | Grayed out, lock icon, no best time          | Tap shows nothing / disabled |
| Unlocked  | Highlighted/colored, play icon               | Tap starts the level |
| Completed | Colored with checkmark, best time displayed  | Tap replays the level |

## Level Progression Rules
1. Only Level 1 is unlocked by default at the start of a new game.
2. Completing a level unlocks the next level.
3. Completing Level N unlocks Level N+1 (up to Level 10).
4. Players can replay any completed level to improve their time.
5. Players cannot skip levels — they must be completed in order.

## Level Definitions (10 Levels)

| Level | Board Size | Number of Queens | Pre-placed Queens | Difficulty  |
|-------|------------|------------------|-------------------|-------------|
| 1     | 5×5        | 5                | 2                 | Tutorial    |
| 2     | 5×5        | 5                | 1                 | Easy        |
| 3     | 6×6        | 6                | 2                 | Easy        |
| 4     | 6×6        | 6                | 1                 | Medium      |
| 5     | 7×7        | 7                | 2                 | Medium      |
| 6     | 7×7        | 7                | 1                 | Medium-Hard |
| 7     | 8×8        | 8                | 2                 | Hard        |
| 8     | 8×8        | 8                | 1                 | Hard        |
| 9     | 8×8        | 8                | 0                 | Expert      |
| 10    | 8×8        | 8                | 0                 | Expert      |

## Interaction Flow
1. Player taps a level tile.
2. If **locked**: nothing happens (button is disabled).
3. If **unlocked** or **completed**: navigate to the Game Screen for that level.
4. A "Back" button or swipe gesture returns to the Home Page.

## Confirmation Dialog (New Game Only)
When the player selects **New Game** and has existing progress:
- Show a confirmation dialog: *"Starting a new game will reset all your progress. Are you sure?"*
- Options: **Yes, Reset** / **Cancel**
- If confirmed, clear all progress and navigate to the Levels page with only Level 1 unlocked.
- If cancelled, return to the Home Page.

## UI Notes
- Locked levels should be clearly distinguishable from unlocked ones (opacity, color, icon).
- The current/next level to play should have a subtle glow or border highlight.
- Smooth transition animation when navigating to a level.
- Display difficulty label on each level tile for player reference.
