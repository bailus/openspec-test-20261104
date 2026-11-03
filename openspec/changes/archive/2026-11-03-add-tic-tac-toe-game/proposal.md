# Proposal

## Why

The project is empty. It needs a first playable app: a browser-based tic-tac-toe game built with React, Redux and shadcn/ui. The game is small but complete, so it also sets the stack and project layout that later work will reuse. shadcn/ui uses Tailwind CSS as its styling foundation; the app will use shadcn/ui components rather than treating raw Tailwind utility classes as its component system.

## What Changes

- Scaffold a new React single-page app (Vite + TypeScript) with Redux Toolkit and shadcn/ui components.
- Add a 3×3 tic-tac-toe board for two players taking turns on the same device (X always moves first).
- Detect wins on rows, columns and diagonals, and detect draws. Highlight the winning line and lock the board once the game ends.
- Show a status line with whose turn it is, the winner, or that the game is a draw.
- Add a "New game" control that resets the board.
- Keep a running score of X wins, O wins and draws, held in memory until the page is reloaded.
- Add unit tests for the game logic and the Redux slice, plus component tests for the main interactions.

Assumptions (not explicitly requested):
- Local two-player only. No computer opponent, online play, move history or undo.
- The score is held in memory only (no `localStorage` or `sessionStorage`). It is lost on reload.

## Capabilities

### New Capabilities
- `tic-tac-toe`: The rules and play of a two-player tic-tac-toe game: board, turns, move validation, win/draw detection, game reset and the running score.

### Modified Capabilities
<!-- None: there are no existing specs. -->

## Impact

- New code: the whole app (`package.json`, Vite/Tailwind config, `src/`).
- New dependencies: react, react-dom, @reduxjs/toolkit, react-redux, Tailwind CSS v4 and the shadcn/ui component setup and helper packages, vite, typescript, @types/node, vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom.
- Requires Node.js and npm, which are not installed in the current environment.
