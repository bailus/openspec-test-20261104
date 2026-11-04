# Tasks

## 1. Wording and score labels

- [x] 1.1 In `selectors.ts`, drop the `(${mark})` suffix from the four computer-mode status strings ("Your turn", "Computer's turn", "You win!", "Computer wins") and leave the two-player strings unchanged. Verify by updating the expectations in `selectors.test.ts`, `ComputerTurn.test.tsx` and `OpponentPicker.test.tsx`, adding a check that no computer-mode status contains "(X)" or "(O)", and running `npm test`.
- [x] 1.2 In `selectScoreTallies`, rename the computer-mode labels to "You" and "Opponent" and keep the keys `you`/`opponent`. Verify by updating the label expectations in `selectors.test.ts`, `Scoreboard.test.tsx` and `OpponentPicker.test.tsx`, and confirm with `npm test` that two-player labels stay "X wins"/"O wins".

## 2. Reset with forfeit (state)

- [x] 2.1 Add `forfeitedBy: Player | null` (default `null`) to `GameState`, and add a `resetGame` reducer and action to `gameSlice.ts`. It does nothing on an empty board. While a game is in progress, the loser is `currentPlayer` in two-player play and `humanPlayer` against the computer: the reducer adds one to the other side's score, sets `forfeitedBy` to the loser, then calls `startNewGame`. After a game ends it calls `startNewGame` and sets `forfeitedBy` to `null`. Verify with `gameSlice.test.ts` cases for:
  - the empty-board no-op (`gameId` unchanged);
  - a two-player forfeit with X to move (O +1, `forfeitedBy` X) and with O to move (X +1);
  - against the computer, a reset on the human's turn and one on the computer's turn: both add one to the computer's mark and set `forfeitedBy` to the human's mark;
  - after a win and after a draw: score unchanged, `gameId` +1, `forfeitedBy` null;
  - opponent and side kept.
- [x] 2.2 Clear `forfeitedBy` in `playMove` (both a placed mark and a restart) and in `setOpponent`/`setHumanPlayer`, but not in `computerMove`. In `selectStatus`, prefix `"You forfeited. "` against the computer or `` `${mark} forfeited. ` `` in two-player play when it is set. Verify with reducer tests that each clearing path resets it and `computerMove` does not, and with selector tests for "O forfeited. X's turn", "You forfeited. Your turn" and "You forfeited. Computer's turn" (human as O, before the computer opens). Run `npm test`.

## 3. Shared UI components

- [x] 3.1 Run `npx shadcn@latest add switch`. Verify that `src/components/ui/switch.tsx` exists, that `package.json` gains no new runtime dependency apart from what shadcn requires (expected: none, because `radix-ui` is already installed), and that `npm run build` passes.

## 4. Game controls

- [x] 4.1 Rewrite `OpponentPicker`. Render the "You play as" group first, as visible label text, then a decorative clickable "X", a `Switch` with `aria-label="You play as O"` that is checked when the human is O, and a decorative clickable "O". Render the Opponent drop-down second. Disable the switch and ignore label clicks while a game is locked. When the opponent is Human, keep rendering the side group with inline `visibility: hidden`. Update `game.css` (remove the radio styles and add the switch row), and delete `src/components/ui/radio-group.tsx` now that nothing imports it. Verify that `grep -rn radio-group src` finds nothing, then verify by rewriting `OpponentPicker.test.tsx` to query `getByRole('switch', { name: 'You play as O' })`, and check that the switch is off by default; that toggling it and clicking "O" both start a game as O with the score reset; that it is disabled mid-game and label clicks do nothing then; that it is absent from the accessibility tree for Human; that it comes before the Opponent select in Tab order; and that `npm test` passes.
- [x] 4.2 In `Scoreboard`, remove the `CardHeader`/`CardTitle` and label the region with `aria-label="Score"`. Verify that `Scoreboard.test.tsx` still finds `getByRole('region', { name: 'Score' })`, add an assertion that no heading named "Score" exists, and run `npm test`.

## 5. Reset button and layout

- [x] 5.1 Add a `ResetButton` component: a shadcn outline `Button` labelled "Reset", hidden with inline `visibility: hidden` while the board is empty. In `Game`, keep a ref to the board group and pass an `onReset` handler that dispatches `resetGame` and then focuses the board's first cell. Put the components in this order: title, picker, board, status, Reset, score. Verify with a new `ResetButton.test.tsx`:
  - the button is not in the accessibility tree on load or while the computer is about to open, and appears after the first mark;
  - a mid-game reset clears the board and adds to the correct tally, in two-player play and against the computer;
  - with fake timers, a reset during the computer's 500 ms delay counts as "Opponent" +1, and no stale computer mark appears after the timers run;
  - the status shows the forfeit notice after a mid-game reset, and not after a reset of a finished game;
  - a reset after a finished game leaves the score unchanged;
  - after activating Reset with the keyboard, `document.activeElement` is the "Row 1, column 1" cell.
- [x] 5.2 Restyle `.status` in `game.css` (smaller text, about 0.95rem at weight 500, with `min-height: 2lh`), and add Reset button spacing. Replace the "no New game button" assertion in `Scoreboard.test.tsx` with one for the new order: the status follows the board and precedes the Reset button and the score, using `compareDocumentPosition`. Verify with `npm test`.
- [x] 5.3 Rename the app to "Vibe-tac-slop": the `<h1>` in `Game.tsx`, the `<title>` in `index.html`, and `"name": "vibe-tac-slop"` in `package.json` and in both top-level `name` entries of `package-lock.json`. Verify by updating the title test in `Scoreboard.test.tsx` to expect "Vibe-tac-slop", running `npm test`, checking with `git diff package-lock.json` that only the two `name` lines changed (edit them by hand; don't run `npm install`), and checking with `grep -rn "Tic-tac-slop" src index.html` that nothing is left.
- [x] 5.4 Update `README.md` for the final layout: the score at the top under the title, the board, status and Reset, then the "You play as" and Opponent controls at the bottom (it still says they are "above the board"). Also mention the logo beside the title, which turns white in dark mode, and the tab icon, which follows the system theme. Verify by reading the README against the "Screen layout" and "App title" requirements, and check with `grep -n "above the board" README.md` that nothing is returned.

## 6. Light/dark theme

- [x] 6.1 Add an inline script to the `<head>` of `index.html`, wrapped in try/catch. It applies `.dark` to `<html>` when `localStorage.theme` is `'dark'`, or when no theme is saved and `prefers-color-scheme: dark` matches. Add `color-scheme: light` to `:root` and `color-scheme: dark` to `.dark` in `src/index.css`. Verify in the dev server: with no saved key, the theme follows the OS setting; with `localStorage.theme = 'dark'`, a hard reload shows no light flash.
- [x] 6.2 Create `src/components/ThemeToggle.tsx`: a `Switch` with `aria-label="Dark mode"` between decorative sun and moon `lucide-react` icons, inside a `position: fixed` wrapper at the top right. Its starting state comes from `document.documentElement.classList`. On change it toggles `.dark` and writes `localStorage.theme`. Mount it in `App.tsx`. Verify with `ThemeToggle.test.tsx`: the switch starts off when `<html>` has no `.dark` and on when it has; toggling it flips the class and stores `'dark'` or `'light'`; and Space toggles it. Run `npm test`.

## 7. Docs and integration checks

- [x] 7.1 Update `README.md`: the `# Vibe-tac-slop` heading, the "You play as" switch and the control order, the "You"/"Opponent" labels, the Reset button, its forfeit rule (the current player loses in two-player play, and you always lose against the computer) and the forfeit notice (replacing "a game in progress has to be played to the end"), the theme switch, and the project layout list (Switch replaces RadioGroup, plus `ThemeToggle`). Verify by reading the README against the specs.
- [x] 7.2 Run `npm run lint`, `npm test` and `npm run build`. Verify that all three pass.
- [x] 7.3 In the dev server at 360px and at desktop width, in both themes, check four things: the theme switch does not overlap the title; nothing shifts when the Reset button appears or disappears, when switching the opponent to or from Human, or when a two-line result status appears; the native select popup matches the theme; and there is no horizontal scrolling. Fix any issue in `game.css` and re-check.
