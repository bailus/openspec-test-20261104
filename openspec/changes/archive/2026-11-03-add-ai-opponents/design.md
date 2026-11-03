# Design

## Context

The game is a React + Redux Toolkit app (see the archived `add-tic-tac-toe-game` design). The rules are pure functions in `src/features/game/logic.ts`. A single `game` slice holds `board`, `currentPlayer` and `score`, and the reducer is the only place that enforces the rules: `playMove` ignores invalid indices, occupied cells and moves after game over. Everything else, such as winner, draw and status text, comes from memoized selectors in `selectors.ts`. Cells are shadcn/ui `Button`s that use `aria-disabled`, never `disabled`. Tests use Vitest + React Testing Library with a fresh store from `makeStore()`.

Requirements are in `specs/computer-opponent/spec.md` and `specs/tic-tac-toe/spec.md`.

## Goals / Non-Goals

**Goals:**
- Keep the AI as pure, deterministic-under-test functions, with randomness passed in, alongside `logic.ts`.
- Keep reducers pure (no `Math.random`, no timers). Keep the reducer as the single place that enforces whose move is allowed.
- Make the computer's pending move cancel by itself when the game it was planned for no longer exists.

**Non-Goals:**
- No web worker or async search: tic-tac-toe minimax is cheap enough to run on the main thread.
- No persistence of opponent/side settings.
- No change to the Scoreboard component or its labels.

## Decisions

**State shape.** Add three fields to `GameState`:

```ts
type Opponent = 'human' | 'easy' | 'medium' | 'hard'
interface GameState {
  board: Cell[]
  currentPlayer: Player
  score: Score
  opponent: Opponent      // default 'medium'
  humanPlayer: Player     // default 'X'; ignored when opponent === 'human'
  gameId: number          // default 0; +1 on every new game
}
```

`Difficulty` is `Exclude<Opponent, 'human'>`. One field, rather than a separate `vsComputer: boolean` plus `difficulty`, rules out invalid combinations. `humanPlayer` is not touched by `setOpponent`, so the side carries over when the opponent changes, including a detour through Human.

**Actions.**
- `setOpponent(opponent)` and `setHumanPlayer(player)`: if the value differs from the current one, set it, clear the board, set `currentPlayer = 'X'`, zero the score and increment `gameId`. Selecting the value that is already chosen does nothing, so re-selecting the current option cannot wipe the score. Both are **refused while a game is in progress** (at least one mark and no result). The UI disables the controls too, but the reducer stays the one place that enforces the rules.
- `playMove(index)` is the **human** move. On a finished board it starts the next game instead of placing a mark: it clears the board, gives X the move and increments `gameId`, keeping the score, opponent and side. Otherwise it applies the existing checks, and it is ignored when it is the computer's turn (`opponent !== 'human' && currentPlayer !== humanPlayer`). When the human is O, the computer-turn hook (below) then sees that it is X's turn and the computer's, and moves.
- The `newGame` action is removed along with the "New game" button. Restarting through `playMove` means a click on a finished board needs no separate wiring in `Board`, and there is no longer a way to clear a game in progress.
- New `computerMove({ index, gameId })`: applied only when it **is** the computer's turn **and** `gameId` matches `state.gameId`, plus the usual validity checks.
- Both delegate to a shared internal `applyMove(state, index)` that places the mark, updates the score and switches turn, so the score logic stays in one place.

Splitting human and computer moves lets the reducer enforce "Human cannot move on the computer's turn" without changing the existing `playMove(index)` call sites and tests. The `gameId` check is what makes stale computer moves safe in the reducer. Checking whose turn it is would not be enough. Take a human playing O who starts a new game while the computer's move is pending: on the fresh board it is the computer's turn again, so only a game identity check can tell the stale move from a new one. A full board snapshot in the payload would also work, but it is larger and harder to read in tests.

**AI module: `src/features/game/ai.ts`.** Pure functions with no React or Redux imports. Randomness comes in as `rng: () => number` (in [0, 1), as `Math.random` returns).
- `randomMove(board, rng)`: picks uniformly from the empty cells.
- `tacticalMove(board, player, rng)`: the first cell that completes `player`'s line, else the first cell that blocks the opponent's line (a winning line with two opponent marks and one empty cell), else `randomMove`. Scans `WINNING_LINES` from `logic.ts`.
- `bestMoves(board, player)`: negamax over the full game tree, returning **every** move that ties for the best score. A win scores `10 - depth`, so faster wins rank higher; a loss scores `depth - 10`, so slower losses rank higher; a draw scores 0.
- `perfectMove(board, player, rng)`: picks one of `bestMoves` at random, so play varies between games. Exposing `bestMoves` lets tests check every move perfect play could make, not just the one a stubbed `rng` happens to pick. Scores are memoized in a module-level `Map` keyed by board string plus player to move. Tic-tac-toe has fewer than 6,000 reachable positions, so the cache stays small and the first move from an empty board costs only a few milliseconds.
- `DIFFICULTY_WEIGHTS: Record<Difficulty, { perfect; tactical; random }>`: the table from the spec as whole-number percentages, held as one constant so tests can assert it. Percentages keep the cumulative thresholds exact: summed as fractions, 0.01 + 0.09 gives 0.09999999999999999, not 0.1.
- `pickStrategy(difficulty, roll)`: takes one roll in [0, 1) and maps it to a strategy using cumulative thresholds in the order perfect, tactical, random. Each threshold is the running percentage total divided by 100. For example, Easy gives `roll < 0.01` → perfect, `< 0.1` → tactical, otherwise random.
- `chooseComputerMove(board, player, difficulty, rng)`: calls `pickStrategy(difficulty, rng())`, then the chosen strategy.

Injecting `rng` makes every strategy and every threshold testable with fixed rolls. No statistical tests are needed.

**Triggering the computer's move: a `useComputerTurn` hook** called from `Game`. It reads `selectIsComputerTurn` (computer opponent, game not over, `currentPlayer !== humanPlayer`), `board`, `currentPlayer`, `difficulty` and `gameId`. When it is the computer's turn, it starts a `setTimeout(COMPUTER_MOVE_DELAY_MS = 500)` that calls `chooseComputerMove(board, currentPlayer, difficulty, Math.random)` and dispatches `computerMove({ index, gameId })` with the `gameId` captured when the timer was scheduled. The effect cleanup clears the timer. Because `board` and `gameId` are effect dependencies, a new game or a change of opponent or side cancels the pending move. If a stale move ever gets through anyway, `computerMove` rejects it because its `gameId` no longer matches. This works with React StrictMode's double effect run, because the cleanup clears the first timer.

Alternatives considered:
- RTK listener middleware: it keeps side effects out of components, but it brings in new middleware wiring and its own cancellation model for a single timer.
- Thunks: cancelling a pending timeout needs extra bookkeeping.
- Choosing the move inside the reducer: this makes the reducer impure and untestable without mocking `Math.random`.

**Selectors.**
- Add `selectOpponent`, `selectHumanPlayer`, `selectIsComputerTurn` and `selectIsInProgress` (some mark placed and not game over). `selectIsInProgress` is shared by the picker's `disabled` state and mirrors the reducer's own check.
- Extend `selectStatus`. When `opponent === 'human'` the in-game strings stay as they are; otherwise it gives "Your turn (X)", "Computer's turn (O)", "You win! (X)", "Computer wins (O)" and "It's a draw". In both modes, a finished game appends " Click the board to play again." to the result. `Status` stays a live region, so the computer's moves and the hint are announced.
- Add `selectScoreTallies`, which returns the three `{ key, label, value }` rows the `Scoreboard` renders. Two-player play gives "X wins" / "O wins" / "Draws". Against the computer it gives "Your wins" = `score[humanPlayer]`, "Opponent wins" = the other mark's tally, and "Draws". The score stays stored by mark. This is safe because changing side resets the score, so a mark's tally always belongs to the same player.

**Board locking.** `Board` passes `isLocked={isComputerTurn}` and `isGameOver` to `Square`. A cell is inactive (`aria-disabled`, no hover) during the computer's turn, or when it is occupied in a game still in progress. After the game ends every cell is active again, because selecting one starts the next game. Cells never use `disabled`, so they stay focusable, and every click still dispatches `playMove`, which the reducer ignores or turns into a restart.

**Picker UI: `OpponentPicker` component**, between the title and the status. It has two controls:
- **"Opponent"**: a shadcn/ui `NativeSelect` (`npx shadcn add native-select`) with the options Human / Computer (Easy) / Computer (Medium) / Computer (Hard). It wraps a real `<select>`, so it gets the platform's own picker on phones, keyboard and screen-reader support for free, and works directly with user-event's `selectOptions` in jsdom. A visible `Label` is linked with `htmlFor`. The Radix-based shadcn `Select` was rejected because it needs pointer-capture polyfills in jsdom and adds a custom popup for a fixed four-item list.
- **"You play"**: a shadcn/ui `RadioGroup` (X / O) with a visible label linked through `aria-labelledby`, rendered only when the opponent is a computer.

Both controls get `disabled` while `selectIsInProgress` is true. Unlike the board cells, it is fine for them to leave the Tab order while disabled. They are settings rather than game content, and the status explains the game state.

**Other UI.** The title (`<h1>` and `index.html` `<title>`) becomes "Tic-tac-slop". `NewGameButton` and the `.game-controls` wrapper are deleted, because the board itself now starts the next game.

**Testing.**
- `ai.test.ts`: each strategy on fixed boards with stub `rng`; `pickStrategy` at the threshold boundaries for every difficulty; perfect vs perfect from an empty board always draws, and perfect never loses to any human move sequence. Both of the last two branch over every move in `bestMoves` as well as every human reply, so all of perfect play's tied choices are covered.
- `gameSlice.test.ts`: the new actions, score reset, `gameId` increments, no-op on the same value, side kept across opponent changes, `playMove` refused on the computer's turn, and `computerMove` refused on the human's turn or with an old `gameId`.
- Component tests: Vitest fake timers (`vi.useFakeTimers()` with user-event's `advanceTimers: vi.advanceTimersByTime`, plus a stubbed `jest.advanceTimersByTime` global so React Testing Library's post-action 0 ms wait resolves). Time only moves when a test advances it, which keeps the 499 ms / 500 ms checks deterministic. The stubbed `Math.random` roll, not the difficulty, is what fixes which strategy and cell the computer picks. These cover the reply after the delay, the computer opening as X, the status strings and the picker's keyboard access. For cancellation, each test must be able to tell a stale move from a new one:
  - With the human as X, a reset during the delay must leave the board empty after the timers run, because the computer has no move in the new game.
  - With the human as O, the board must still be empty at 499 ms after the reset and hold exactly one X at 500 ms.

## Risks / Trade-offs

- [Perfect search on the main thread could stall the UI] → Memoization makes later moves near-instant, and a test sets a time budget for the empty-board search.
- [Fake timers combined with user-event and Radix can hang tests] → Use user-event's `advanceTimers` option and the `jest` timer shim described under Testing. Keep AI correctness tests at the pure-function level so component tests only check the wiring.
- [Without a "New game" button, a player cannot abandon a game in progress] → This is intended (requested). Games last at most nine moves, and the computer moves within a second.
- [Disabling the picker mid-game could confuse a player looking for it] → The controls are visibly greyed out, and they unlock as soon as the result shows.
- [Players may expect "Hard" to be unbeatable] → This is intended: Hard plays its best move only 40% of the time (50% tactical, 10% random). The proposal states it, and a later change can add a stronger level if wanted.
- [A future change to the hook could forget to cancel a stale computer move] → `computerMove` checks the `gameId` the move was planned for, so cancellation does not depend on the timer cleanup alone. A new reset action must also increment `gameId`, and a reducer test covers each existing reset path.

## Migration Plan

Client-only. The app now opens against Computer (Medium), so existing two-player component and reducer tests first select Human: `renderGame({ opponent: 'human' })`, or `setOpponent('human')` in reducer tests. Tests that used the "New game" button restart by selecting a cell on a finished board instead. Rollback is reverting the change.
