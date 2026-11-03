# Proposal

## Why

The game needs two people at one device. One person cannot play at all. Adding a computer opponent at three difficulty levels gives a single player someone to play against, at a strength that suits them. Since most players will be playing alone, the game opens against the computer, and the controls are kept simple around that.

## What Changes

- Add an opponent drop-down with four choices: **Human** (two players taking turns on one device), **Computer (Easy)**, **Computer (Medium)** and **Computer (Hard)**. **Computer (Medium)** is selected when the app loads.
- When playing the computer, the human picks which side to play, **X** or **O**, with radio buttons. X always moves first, so if the human picks O the computer makes the opening move.
- On its turn, the computer picks a move after a short pause, without the human doing anything. While it is the computer's turn, the human cannot place a mark.
- Each difficulty picks every move from a weighted mix of three strategies:
  - **Perfect**: optimal play (minimax).
  - **Tactical**: complete its own winning line if it can, otherwise block the human's winning line, otherwise play a random empty cell.
  - **Random**: any empty cell.

  | Difficulty | Perfect | Tactical | Random |
  | ---------- | ------- | -------- | ------ |
  | Easy       | 1%      | 9%       | 90%    |
  | Medium     | 10%     | 50%      | 40%    |
  | Hard       | 40%     | 50%      | 10%    |

  Every level can be beaten: even Hard plays its best move only two times in five, though it is tactical or better 90% of the time.
- The opponent and side options are disabled while a game is in progress, meaning at least one mark has been placed and the game has not ended. They can be changed on an empty board or once the game has ended. Changing either one starts a new game and resets the score to zero, so results against different opponents are never mixed.
- **BREAKING**: The "New game" button is removed. Once a game ends, the status adds "Click the board to play again", and selecting any cell clears the board and starts the next game with the same settings. A game in progress can no longer be abandoned: it has to be played to the end.
- Against the computer, the score shows **Your wins**, **Opponent wins** and **Draws**. Two-player mode keeps **X wins**, **O wins** and **Draws**.
- Against the computer, the status says whose turn it is and who won from the human's point of view (for example "Your turn (X)", "Computer wins (O)").
- The app title, both the page heading and the browser tab, becomes **Tic-tac-slop**.

Assumptions (minor, not confirmed with the requester):
- Changing the human's side resets the score in the same way as changing the opponent.
- The computer pauses for about half a second before moving, so its move can be seen as a separate turn.
- Clicking the board to start the next game only clears it: that click does not also place a mark.
- The score labels are "Your wins" and "Opponent wins", following the existing "X wins" pattern.

Out of scope: computer-vs-computer play, keeping the opponent setting across page reloads, and per-difficulty score history.

## Capabilities

### New Capabilities
- `computer-opponent`: choosing between a human or computer opponent, choosing the human's side, locking those choices during a game, the three difficulty levels and their strategy mix, how the computer takes its turn, and the status and score wording when playing the computer.

### Modified Capabilities
- `tic-tac-toe`:
  - "New game" changes from a button to selecting a cell after the game has ended, and the computer opens when the human plays O.
  - "Board locked after game over" and "Keyboard and screen-reader access" change so that selecting a cell after the game has ended starts the next game instead of doing nothing.
  - "Running score" resets when the opponent or side changes, and uses "you / opponent" labels against the computer.
  - "Alternating turns" and "Win detection" are reworded so they still hold when one side is the computer.

## Impact

- `src/features/game/gameSlice.ts`: new state (`opponent` defaulting to Medium, `humanPlayer`, and a `gameId` that lets stale computer moves be rejected) and actions. Human moves are refused on the computer's turn, and selecting a cell on a finished board starts the next game. The `newGame` action is removed.
- New pure module `src/features/game/ai.ts` with the three strategies and the weighted difficulty picker.
- `src/features/game/selectors.ts`: status text that knows about the computer and adds the play-again hint, a "computer's turn" selector, and a "game in progress" selector.
- Components: an opponent/side picker that is disabled during a game, a hook that plays the computer's move, the Board locking during the computer's turn, score labels for computer mode, the new title, and removal of `NewGameButton`.
- `index.html`: the page title.
- New shadcn/ui components (`native-select`, `radio-group`, `label`) added through the shadcn CLI. No other new dependencies.
- Tests for the AI logic, the reducer and the components. Existing two-player tests now choose Human first, because the default opponent is the computer. README update.
