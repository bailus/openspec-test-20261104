# Tasks

## 1. AI strategies (pure logic)

- [x] 1.1 Create `src/features/game/ai.ts` with the `Difficulty` and `Rng` types and `randomMove(board, rng)`. Verify in `ai.test.ts` that a stub `rng` selects the expected empty cell and that occupied cells are never returned.
- [x] 1.2 Implement `tacticalMove(board, player, rng)`: win, else block, else random. Verify with tests for win-over-block priority, blocking a row, a column and a diagonal, and falling back to random when there is no threat.
- [x] 1.3 Implement `bestMoves(board, player)` (negamax with depth-weighted scores, returning every move tied for best, with a memo cache keyed by board and player) and `perfectMove(board, player, rng)`, which picks one of them at random. Verify with tests that it takes an immediate win and blocks a forced loss. Also verify, branching over every move in `bestMoves` as well as every human reply, that perfect vs perfect from an empty board always draws and that perfect never loses against any human move sequence. Finally, verify that the empty-board search finishes within a small time budget (e.g. under 200 ms).
- [x] 1.4 Add `DIFFICULTY_WEIGHTS` (Easy 0.2/0.3/0.5, Medium 0.5/0.4/0.1, Hard 0.9/0.08/0.02), `pickStrategy(difficulty, roll)` and `chooseComputerMove(board, player, difficulty, rng)`. Verify with tests that each difficulty's weights sum to 1, that rolls just below and at every cumulative threshold map to the right strategy, and that `chooseComputerMove` uses the strategy the first roll selects.

## 2. Game state and rules

- [x] 2.1 Extend `GameState` in `gameSlice.ts` with `opponent` (default `'human'`), `humanPlayer` (default `'X'`) and `gameId` (default `0`), and make `newGame` increment `gameId`. Factor the existing move logic into a shared `applyMove` helper. Verify that the existing `gameSlice.test.ts` still passes unchanged, and add a test that `newGame` increments `gameId`.
- [x] 2.2 Add `setOpponent` and `setHumanPlayer`: on a real change they clear the board, give X the move, zero the score and increment `gameId`; the same value is a no-op; `setOpponent` leaves `humanPlayer` unchanged. Verify with reducer tests for both reset paths, for the no-op, and for the side being kept through Easy → Human → Hard.
- [x] 2.3 Make `playMove` ignore moves on the computer's turn, and add `computerMove({ index, gameId })`, which applies only on the computer's turn when `gameId` matches. Verify with reducer tests: the human is refused on the computer's turn (both as X and as O); `computerMove` is refused on the human's turn, in two-player mode, after game over, and with the previous `gameId` after a `newGame` where it is still the computer's turn (human as O); and a computer win or draw updates the score.
- [x] 2.4 Add `selectOpponent`, `selectHumanPlayer` and `selectIsComputerTurn` to `selectors.ts`, and extend `selectStatus` with the computer-mode strings ("Your turn (X)", "Computer's turn (O)", "You win! (X)", "Computer wins (O)", "It's a draw"). Verify with selector tests that two-player strings are unchanged and that each computer-mode string appears for the right state.

## 3. Computer turn and board locking

- [x] 3.1 Implement the `useComputerTurn` hook (500 ms `setTimeout`, `chooseComputerMove` with `Math.random`, dispatch `computerMove` with the `gameId` captured at scheduling, clear the timer in cleanup) and call it from `Game`. Verify with component tests using fake timers, with any computer difficulty set through the store. The stubbed `Math.random` roll, not the difficulty, fixes the strategy and cell. Check that the computer replies after the delay, and makes no move once the human's move ends the game.
- [x] 3.2 Lock the board on the computer's turn (`isLocked={isGameOver || isComputerTurn}` in `Board`). Verify with component tests that clicking an empty cell during the computer's turn leaves it empty, and that all cells stay in the Tab order and keep their labels.
- [x] 3.3 Verify with component tests that the computer opens as X when the human is O, both after a side change and after "New game". Also verify that a pending computer move is never placed after a reset during the delay, with each test able to tell a stale move from a new one:
  - Human as X: "New game", or a change to a different computer difficulty, during the delay leaves the board empty after all timers run.
  - Human as O: after "New game" during the delay, the board is still empty at 499 ms and holds exactly one X at 500 ms.
  - Side change X → O during the delay: the same 499 ms / 500 ms check.

## 4. Opponent and side picker

- [x] 4.1 Add the shadcn/ui components with `npx shadcn@latest add radio-group label`. Verify that `src/components/ui/radio-group.tsx` and `label.tsx` exist and that `npm run build` passes.
- [x] 4.2 Create the `OpponentPicker` component: an "Opponent" radio group (Human, Computer – Easy, Computer – Medium, Computer – Hard), plus a "You play" X/O group shown only for computer opponents, wired to `setOpponent` and `setHumanPlayer`. Render it in `Game` between the title and the status, and add layout CSS to `game.css` so the options wrap. Verify with component tests that Human is selected by default, the side group is hidden in two-player mode, choosing an option resets the board and score, the groups have accessible names and are keyboard-operable (Tab in, arrow keys to change), and the status shows the computer-mode strings.
- [x] 4.3 Check the layout at 360px wide in the dev server (`npm run dev`). Verify that the picker, status, board, controls and scoreboard are all visible without horizontal scrolling.
- [x] 4.4 Update `README.md` (intro and project layout) to describe the computer opponent, the three difficulties and their strategy mix, and the new `ai.ts` module. Verify by reading that it matches the shipped behaviour.

## 5. Integration checks

- [x] 5.1 Run `npm test`, `npm run lint` and `npm run build`, and verify all three pass.
- [x] 5.2 Play in the dev server: one two-player game, one game at each difficulty as X, and one as O against Hard. Verify that the computer moves on its own, that the status text and score behave as specified, and that changing the opponent or side resets the score.
- [x] 5.3 Run `openspec validate add-ai-opponents --strict` and verify that it passes.

## 6. Revised controls

These revisions replace the radio-button opponent picker (4.2), the default opponent (2.1) and the "New game" button. The proposal, specs and design describe the revised behaviour.

- [x] 6.1 Make Computer (Medium) the default opponent. Move existing two-player tests onto Human (`renderGame({ opponent: 'human' })` in component tests, `setOpponent('human')` in reducer and selector tests). Verify that the whole suite passes with no change to what those tests assert.
- [x] 6.2 Restart on the board: `playMove` on a finished board clears it, gives X the move and increments `gameId`, keeping score, opponent and side. Remove the `newGame` action. Verify with reducer tests: a restart after a win and after a draw places no mark and keeps the score; selecting an occupied cell mid-game does not restart.
- [x] 6.3 Refuse `setOpponent` and `setHumanPlayer` while a game is in progress, and add `selectIsInProgress`. Verify with reducer tests (refused after the first mark; allowed on an empty board, including during the computer's pending opening move, and after a win or draw) and with selector tests.
- [x] 6.4 Add the play-again hint to `selectStatus` (" Click the board to play again." after any result, in both modes) and add `selectScoreTallies` (X wins / O wins / Draws for Human; Your wins / Opponent wins / Draws against the computer, with "Your wins" following `humanPlayer`). Verify with selector tests for both modes and both sides.
- [x] 6.5 Board and Scoreboard: cells become active again once the game ends, while still being inactive when occupied mid-game and during the computer's turn; the Scoreboard renders `selectScoreTallies`. Verify with component tests that clicking or pressing Enter on any cell after a win or draw starts a new game, that the computer opens after a restart when the human is O, and that the score labels match each mode.
- [x] 6.6 Replace the opponent radio group with a shadcn/ui `NativeSelect` (`npx shadcn add native-select`) labelled "Opponent", with options "Human", "Computer (Easy)", "Computer (Medium)" and "Computer (Hard)". Keep the X/O radio group. Disable both while `selectIsInProgress`. Verify with component tests: Medium is the default; the select has the accessible name "Opponent" and changes with `selectOptions` and the keyboard; both controls are disabled after the first mark and enabled on an empty board and after the game ends; and the side group is hidden for Human. Delete the radio-group test cases this replaces.
- [x] 6.7 Change the title to "Tic-tac-slop" (the `<h1>` and the `index.html` `<title>`), and delete `NewGameButton` and its `.game-controls` wrapper and CSS. Verify with a component test that the heading reads "Tic-tac-slop" and that there is no "New game" button.
- [x] 6.8 Update `README.md` for the drop-down, the default opponent, the locked options, click-to-restart, the score labels and the removed button. Verify by reading that it matches the shipped behaviour.

## 7. Integration checks (revised controls)

- [x] 7.1 Run `npm test`, `npm run lint` and `npm run build`, and verify all three pass.
- [x] 7.2 In the dev server, check the layout at 360px wide with no horizontal scrolling. Then play: one game against the default Medium computer, one as O against Hard (restarting by clicking the board), and one two-player game. Verify that the options lock during play and unlock after the result, that clicking the board restarts, that the score labels follow the mode, and that the title reads "Tic-tac-slop".
- [x] 7.3 Run `openspec validate add-ai-opponents --strict` and verify that it passes.

## 8. Revised difficulty mix

- [x] 8.1 Change `DIFFICULTY_WEIGHTS` to whole-number percentages with the new mix (Easy 1/9/90, Medium 10/30/60, Hard 20/50/30), with `pickStrategy` comparing the roll against each running total divided by 100. Verify with `ai.test.ts`: the weights match the table and sum to 100, rolls just below and at each threshold (0.01/0.1, 0.1/0.4, 0.2/0.7) map to the right strategy, and the `chooseComputerMove` cases use rolls that pick each strategy under the new mix.
- [x] 8.2 Update the README's difficulty table and the line describing Hard. Verify by reading that it matches `DIFFICULTY_WEIGHTS`.
- [x] 8.3 Run `npm test`, `npm run lint`, `npm run build` and `openspec validate add-ai-opponents --strict`, and verify that all pass.

## 9. Second difficulty revision

- [x] 9.1 Change `DIFFICULTY_WEIGHTS` to Medium 10/50/40 and Hard 40/50/10 (Easy stays 1/9/90). Verify with `ai.test.ts`: the weights match the table and sum to 100, rolls just below and at each threshold (Medium 0.1/0.6, Hard 0.4/0.9) map to the right strategy, and the `chooseComputerMove` cases use rolls that pick each strategy under the new mix.
- [x] 9.2 Update the README's difficulty table and the line describing Hard. Verify by reading that it matches `DIFFICULTY_WEIGHTS`.
- [x] 9.3 Run `npm test`, `npm run lint`, `npm run build` and `openspec validate add-ai-opponents --strict`, and verify that all pass.

## 10. Layout tweaks

- [x] 10.1 Lay out the "Opponent" and "You play" groups side by side: the `.opponent-picker` container uses `flex-direction: row` (wrapping only if a narrow screen needs it). Verify in the dev server at 360px and at desktop width that both groups sit on one row with no horizontal scrolling, and that the drop-down alone is laid out cleanly when the opponent is Human.
- [x] 10.2 Center the "Score" title in the Scoreboard card. Verify in the dev server that the title is centered above the tallies, and that the component tests still find it as the "Score" region's heading.
- [x] 10.3 Run `npm test`, `npm run lint`, `npm run build` and `openspec validate add-ai-opponents --strict`, and verify that all pass.
