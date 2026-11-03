# Tic-tac-slop

A tic-tac-toe game for one device, built with React, Redux Toolkit and shadcn/ui (Tailwind CSS v4), using Vite and TypeScript. Play against another person on the same device, or against the computer.

X always moves first. The game detects wins and draws, highlights the winning line, and keeps a running score until the page is reloaded. When a game ends, click any cell to start the next one: there is no separate "New game" button, and a game in progress has to be played to the end.

## Choosing an opponent

Pick the opponent from the drop-down above the board: **Computer (Medium)** (the default), **Computer (Easy)**, **Computer (Hard)**, or **Human** for two players taking turns on one device. Against the computer you also choose whether you play **X** or **O**. If you play O, the computer makes the opening move. The computer moves on its own about half a second after your turn.

Both choices are disabled while a game is in progress. You can change them on an empty board or once the game has ended. Changing either one starts a new game and resets the score to zero.

Against the computer the score shows **Your wins**, **Opponent wins** and **Draws**. Two-player games show **X wins**, **O wins** and **Draws**.

For each move, the computer picks one of three strategies at random:

- **Perfect**: the best possible move (full minimax search).
- **Tactical**: complete its own line if it can, otherwise block yours, otherwise any empty cell.
- **Random**: any empty cell.

| Difficulty | Perfect | Tactical | Random |
| ---------- | ------- | -------- | ------ |
| Easy       | 1%      | 9%       | 90%    |
| Medium     | 10%     | 50%      | 40%    |
| Hard       | 40%     | 50%      | 10%    |

Every level can be beaten: even Hard plays its best move only two times in five, though it is tactical or better 90% of the time.

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
  components/ui/          shadcn/ui components (Button, Card, Label, NativeSelect, RadioGroup)
  features/game/
    logic.ts              Pure game rules: winning lines, calculateWinner, isBoardFull
    ai.ts                 Pure computer strategies (perfect, tactical, random) and difficulty weights
    gameSlice.ts          Redux slice: board, current player, score, opponent, human side, game id;
                          playMove (also restarts a finished game) / computerMove / setOpponent / setHumanPlayer
    selectors.ts          Derived state: winner, winning line, draw, game in progress, computer's turn,
                          status text, score labels
    useComputerTurn.ts    Hook that plays the computer's move after a short pause
    components/           Game, OpponentPicker, Board, Square, Status, Scoreboard
  test/                   Vitest setup and test helpers
```

Planning documents for this project live in `openspec/`.
