# Home Page - Queens Game

## Overview
The home page is the main entry point of the Queens game. It displays the game title and a set of navigation buttons. The layout of buttons adapts based on whether the player has previous progress.

## Screen Layout

### Title Section
- Game title: **"Queens"** displayed prominently at the top center of the screen.
- Subtitle: "Place your queens wisely" (optional tagline below the title).

### Buttons Section
The buttons are displayed vertically, centered on the screen. Their visibility depends on player progress.

#### First-Time Player (No Previous Progress)
The following buttons are shown:
1. **New Game** - Starts a fresh game, navigates to the Levels page.
2. **Settings** - Opens the settings screen.

#### Returning Player (Has Previous Progress)
The following buttons are shown:
1. **Continue** - Resumes from the last played/uncompleted level.
2. **New Game** - Starts a fresh game, navigates to the Levels page.
3. **Levels** - Opens the Levels page showing all levels with their completion status.
4. **Settings** - Opens the settings screen.

## Button Behavior

| Button     | Action                                                                                     |
|------------|--------------------------------------------------------------------------------------------|
| Continue   | Navigates directly to the last uncompleted level the player was on.                        |
| New Game   | Resets game progress and navigates to the Levels page with only Level 1 unlocked.          |
| Levels     | Opens the Levels page showing all 10 levels with locked/unlocked/completed status.         |
| Settings   | Opens the Settings screen (sound, theme, etc.). Details to be defined later.               |

## Progress Detection
- On app launch, check local storage (AsyncStorage) for saved game progress.
- If progress data exists (at least one level has been started or completed), show the **Continue** and **Levels** buttons.
- If no progress data exists, hide **Continue** and **Levels** buttons.

## Offline Mode
- The game is fully playable offline.
- All progress is stored locally on the device using AsyncStorage.
- No network requests are needed for the home page or any game functionality.

## Data Model (Local Storage)

```json
{
  "currentLevel": 1,
  "levels": {
    "1": { "unlocked": true, "completed": false, "bestTime": null },
    "2": { "unlocked": false, "completed": false, "bestTime": null },
    "3": { "unlocked": false, "completed": false, "bestTime": null },
    "4": { "unlocked": false, "completed": false, "bestTime": null },
    "5": { "unlocked": false, "completed": false, "bestTime": null },
    "6": { "unlocked": false, "completed": false, "bestTime": null },
    "7": { "unlocked": false, "completed": false, "bestTime": null },
    "8": { "unlocked": false, "completed": false, "bestTime": null },
    "9": { "unlocked": false, "completed": false, "bestTime": null },
    "10": { "unlocked": false, "completed": false, "bestTime": null }
  }
}
```

## UI Notes
- Buttons should have a consistent style (rounded corners, padding, clear text).
- Use a clean, minimal design with a chess/puzzle-inspired color scheme.
- Buttons should have press feedback (slight scale or opacity change on tap).
