# Tasks

## 1. Project setup

- [x] 1.1 Install Node.js LTS (≥ 20) and npm, and verify that `node --version` and `npm --version` succeed
- [x] 1.2 Scaffold a Vite `react-ts` app in a temporary folder outside the repository, then copy the generated files into the repository root without overwriting anything that exists. Never run the scaffold directly in the root or with options that clear the target folder. Verify that `openspec/` and `.claude/` are unchanged, and that `npm install` and `npm run dev` serve the default page
- [x] 1.3 Add `@reduxjs/toolkit` and `react-redux`, and verify that `npm ls @reduxjs/toolkit react-redux` lists both
- [x] 1.4 Add Tailwind CSS v4 through `@tailwindcss/vite` with `@import "tailwindcss"` in `index.css`
- [x] 1.5 Prepare for shadcn/ui: install `@types/node`, add the `@/*` → `./src/*` path alias to `compilerOptions` in both `tsconfig.json` and `tsconfig.app.json`, and add the matching `resolve.alias` in `vite.config.ts`. Then run `shadcn init`, add the `Button` and `Card` components, and verify that both render in the dev server and that `npm run build` type-checks
- [x] 1.6 Add Vitest, jsdom, `@testing-library/react`, `@testing-library/user-event` and `@testing-library/jest-dom`. Configure `test` in `vite.config.ts` with `environment: 'jsdom'` and `setupFiles: ['./src/test/setup.ts']`. The setup file imports `@testing-library/jest-dom/vitest` and runs `cleanup` after each test. Add a `"test"` npm script, and verify that `npm test` runs a placeholder test that passes and uses a jest-dom matcher
- [x] 1.7 Remove the Vite template demo content (counter, logos, App.css), and verify that `npm run build` succeeds

## 2. Game logic

- [x] 2.1 Implement `src/features/game/logic.ts` with the eight winning lines, `calculateWinner(board)` (returning the winner and the winning line) and `isBoardFull(board)`, and verify with `logic.test.ts` covering every row, column and diagonal, a full board with no winner, a win on the ninth move, and an empty board

## 3. Redux store

- [x] 3.1 Implement the `game` slice (`gameSlice.ts`) with the `board`, `currentPlayer` and `score` state and the `playMove` / `newGame` actions. It ignores moves with an index outside the integers 0–8, moves on occupied cells, and moves after game over. It increments the score when a move ends the game. Verify with `gameSlice.test.ts` covering turn alternation, the occupied-cell no-op, the out-of-range no-op (-1, 9, 1.5), the post-game lock after a win and after a draw (score unchanged), score increments for X win, O win and draw, and `newGame` keeping the score
- [x] 3.2 Implement memoized selectors (`selectWinner`, `selectWinningLine`, `selectIsDraw`, `selectStatus`), and verify with selector unit tests for in-progress, win and draw states
- [x] 3.3 Create `src/app/store.ts` (`makeStore()` factory plus the app store) and typed hooks in `src/app/hooks.ts`, wrap `<App />` in `<Provider>` in `main.tsx`, and verify that `npm run build` type-checks cleanly

## 4. UI components

- [x] 4.1 Build `Square` with the shadcn/ui `Button` component and `Board` as a responsive 3×3 CSS grid, in `src/features/game/components/`. Cells get `aria-label`s such as "Row 1, column 2, X" or "Row 1, column 2, empty", and the winning cells are highlighted. Occupied cells, and every cell after game over, use `aria-disabled="true"` and never the `disabled` attribute. Verify with a component test that clicking cells places alternating X/O marks, that clicking an occupied cell does nothing, that empty and filled cells have the expected labels, and that occupied cells have `aria-disabled` and no `disabled`
- [x] 4.2 Build `Status` (`role="status"`, `aria-live="polite"`) showing the turn, winner or draw, and verify with component tests that the text updates for turn, X-win, O-win and draw
- [x] 4.3 Build `Scoreboard` with shadcn/ui `Card` and the "New game" control with shadcn/ui `Button`; verify with component tests that the tallies update after an X win, an O win and a draw, and that "New game" clears the board and keeps the score
- [x] 4.4 Compose `Game`/`App` with a responsive CSS layout and an aspect-square board, and verify at 360px width in the browser that there is no horizontal scroll and that the board, status and controls are visible
- [x] 4.5 Add keyboard interaction tests. Tab to a cell, then Enter/Space places a mark. Tab still reaches filled cells and, after game over, every cell, and Enter/Space on them changes nothing. Verify that the tests pass and that focus rings are visible in the browser

## 5. Integration and docs

- [x] 5.1 Play complete games in the dev server (X row win, O column win, diagonal win, draw then clicking the full board, mid-game reset, reload resets score), and verify that each spec scenario behaves as described
- [x] 5.2 Write `README.md` with prerequisites, `npm install`, `npm run dev`, `npm test` and `npm run build`, and verify that each documented command runs as written
- [x] 5.3 Run `npm test` and `npm run build` on a clean install, and verify that both pass with no type errors

## Workflow follow-up

- Archive the change with `/opsx:archive` once implementation is reviewed.
