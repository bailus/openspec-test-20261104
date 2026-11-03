# Tic-tac-toe

A two-player tic-tac-toe game for one device, built with React, Redux Toolkit and shadcn/ui (Tailwind CSS v4), using Vite and TypeScript.

X always moves first. The game detects wins and draws, highlights the winning line, and keeps a running score until the page is reloaded.

## Prerequisites

- Node.js 20 or later (LTS recommended), with npm

## Getting started

```sh
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Scripts

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the Vite dev server with hot reload        |
| `npm test`        | Run the unit and component tests once (Vitest)   |
| `npm run build`   | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally              |
| `npm run lint`    | Lint with Oxlint                                 |

## Project layout

```
src/
  app/                    Redux store (makeStore) and typed hooks
  components/ui/          shadcn/ui components (Button, Card)
  features/game/
    logic.ts              Pure game rules: winning lines, calculateWinner, isBoardFull
    gameSlice.ts          Redux slice: board, current player, score; playMove / newGame
    selectors.ts          Derived state: winner, winning line, draw, status text
    components/           Game, Board, Square, Status, Scoreboard, NewGameButton
  test/                   Vitest setup and test helpers
```

Planning documents for this project live in `openspec/`.
