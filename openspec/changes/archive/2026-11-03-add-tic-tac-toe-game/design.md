# Design

## Context

The repository holds only OpenSpec scaffolding, with no app code, package manifest or tooling. The request fixes the stack: React, Redux and shadcn/ui. shadcn/ui uses Tailwind CSS as its styling foundation; app components should use shadcn/ui rather than being authored as raw Tailwind utility-class markup. Node.js/npm are not installed in the current environment, so they must be installed before implementation. Requirements are in `specs/tic-tac-toe/spec.md`.

## Goals / Non-Goals

**Goals:**
- Keep the game rules as pure functions, separate from Redux and React, so they are trivial to unit-test.
- Keep Redux state minimal and derive everything else (winner, draw, status text).
- Use shadcn/ui components for the game's controls and shared UI elements.
- Use a modern, conventional layout that later features can grow into.

**Non-Goals:**
- No routing, backend, persistence or state-sync middleware.
- No AI opponent and no move history or time travel (see proposal assumptions).
- No component library beyond shadcn/ui; use CSS for app-specific layout and game states.

## Decisions

**Build tool: Vite + React + TypeScript.** Vite's `react-ts` template gives fast dev/build with almost no config. Create React App is deprecated, and Next.js adds SSR/routing we do not need. TypeScript catches cell index, player and action payload mistakes for little cost.

**State: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`).** RTK is the officially recommended way to write Redux. `createSlice` removes action/reducer boilerplate, and Immer allows simple updates. We use one `game` slice:

```ts
type Player = 'X' | 'O';
type Cell = Player | null;
interface GameState {
  board: Cell[];            // length 9, row-major
  currentPlayer: Player;
  score: { X: number; O: number; draws: number };
}
```

Actions: `playMove(index: number)` and `newGame()`. The reducer ignores `playMove` when the index is not an integer from 0 to 8 (the type system cannot enforce this), when the cell is occupied, or when the game is over, which covers the occupied-cell and board-locked requirements. When a move ends the game, the same reducer call increments the score, so the score cannot drift from the results. Winner, winning line and draw are **derived** with `calculateWinner(board)` in memoized selectors (`selectWinner`, `selectWinningLine`, `selectIsDraw`, `selectStatus`). Storing them would duplicate state that could fall out of sync. The alternative, plain `useReducer`, would be enough for a game this size, but the request names Redux explicitly.

**Game logic module: `src/features/game/logic.ts`.** It holds the eight winning lines as index triples and `calculateWinner(board) → { winner, line } | null`, plus `isBoardFull`. These are pure functions with no imports from React or Redux.

**Components** (`src/features/game/components/`): `Game` (layout), `Board`, `Square`, `Status` (`role="status"` / `aria-live="polite"`), `Scoreboard` (a shadcn/ui `Card`), and a shadcn/ui `Button` for "New game". Use shadcn/ui components for shared controls and CSS for the board grid, responsive layout and winning-cell state.

`Square` is a shadcn/ui `Button`, so keyboard activation and focus work natively. Its `aria-label` reads "Row 1, column 2, X", or "…, empty" for an empty cell. Occupied cells and all cells after game over get `aria-disabled="true"` and a disabled look, but **not** the `disabled` attribute. A `disabled` button leaves the Tab order, so keyboard and screen-reader users could no longer reach filled cells to hear their contents. Their clicks still dispatch `playMove`, and the reducer ignores them, so the reducer is the one place that enforces the rules. Components read state through `useAppSelector` and dispatch through `useAppDispatch` (typed hooks in `src/app/hooks.ts`).

**Component system and styling: shadcn/ui with Tailwind CSS v4.** Initialize shadcn/ui for Vite and add the components used by the game (`Button`, `Card`). shadcn/ui components are checked into the app and use Tailwind CSS internally; use those components for controls instead of building the UI from raw utility classes. Keep app-specific layout and board states in CSS. Tailwind v4 integrates as a Vite plugin (`@tailwindcss/vite`) with a single `@import "tailwindcss"` and no PostCSS/config files.

`shadcn init` on Vite fails unless these are in place first:
- an `@/*` → `./src/*` path alias in `compilerOptions` of both `tsconfig.json` and `tsconfig.app.json`
- a matching `resolve.alias` in `vite.config.ts`
- `@types/node` installed, for `path` in the Vite config

We stay on Tailwind v4 and do not plan a fallback to v3. The current shadcn/ui CLI and component sources target v4. Moving to v3 would mean an older shadcn/ui release with different component code and theming, which is a stack change rather than a drop-in swap. If v4 tooling breaks, fix it within v4 or come back to this decision.

**Testing: Vitest + React Testing Library + jsdom.** Vitest shares Vite's config and runs natively with TS. The `test` block in `vite.config.ts` sets `environment: 'jsdom'` and `setupFiles: ['./src/test/setup.ts']`. That setup file imports `@testing-library/jest-dom/vitest` to register matchers such as `toBeInTheDocument`, and runs RTL `cleanup` after each test. Logic and reducer tests are plain unit tests. Component tests render `<Game />` with a fresh store (`makeStore()` factory) and drive it through clicks and keyboard events.

**Project layout:**
```
src/
  app/store.ts, hooks.ts
  components/ui/            # shadcn/ui components (button.tsx, card.tsx)
  lib/utils.ts              # shadcn/ui `cn` helper
  features/game/logic.ts, gameSlice.ts, selectors.ts, *.test.ts
  features/game/components/*.tsx, *.test.tsx
  test/setup.ts
  main.tsx, App.tsx, index.css
```

**Scaffolding into a non-empty root.** The repository root already holds `openspec/` and `.claude/`. When `npm create vite` runs in a non-empty folder it asks what to do, and one option is "Remove existing files and continue". To avoid that prompt entirely, scaffold into a temporary folder outside the repo, then copy the generated files into the root without overwriting anything that exists. Never run the scaffold with options that clear the target folder.

## Risks / Trade-offs

- [Node/npm missing in this environment] → First task installs/verifies Node LTS (≥ 20) before scaffolding. Nothing else can run until this is done.
- [Redux is heavier than this game needs] → Accepted because the user asked for it. RTK keeps the boilerplate small, and the pure logic module stays reusable if Redux is ever removed.
- [Scaffolding could delete `openspec/` and `.claude/`] → Scaffold in a temporary folder and copy the files in (see Decisions). Check that both folders are intact afterwards.
- [Tailwind v4 is newer and has fewer examples] → shadcn/ui's own Vite guide targets v4, so follow it. v3 is not a cheap fallback (see Decisions).
- [shadcn/ui init fails without a path alias] → Set up the `@/*` alias and `@types/node` before running `shadcn init` (see Decisions).
- [Score is lost on reload] → This is intended for this change (see the Running score requirement). Persistence can be added later with `localStorage` without changing the slice shape.
