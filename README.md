# Vibe-tac-slop

A tic-tac-toe game for one device, built with React, Redux Toolkit and shadcn/ui (Tailwind CSS v4), using Vite and TypeScript. Play against another person on the same device, or against the computer.

X always moves first. The game detects wins and draws, highlights the winning line, and keeps a running score until the page is reloaded. When a game ends, click any cell to start the next one.

From top to bottom the page shows the logo and title, the score, the board, the status line, the **Reset** button, and the game controls.

The **Reset** button under the board clears it at any time. It is hidden on an empty board, but keeps its space so the page doesn't jump. Resetting a game in progress counts as a forfeit: in two-player games the player whose turn it is loses, and against the computer you always lose, whoever's turn it is. The status then opens with "X forfeited." (or "You forfeited." against the computer) until a player (not the computer) next places a mark. Resetting a finished game just clears the board.

Use the switch in the top-right corner to change between light and dark mode. The first time you visit, it follows your system setting; after that your choice is remembered in the browser. The logo beside the title turns white in dark mode. The browser tab icon (`public/favicon.svg`) is the same logo, but it follows your system's light or dark setting rather than the in-app switch, because browsers draw it outside the page.

## Choosing an opponent

Below the board, the **You play as** switch chooses whether you play **X** (left) or **O** (right) against the computer. Next to it, pick the opponent from the drop-down: **Computer (Medium)** (the default), **Computer (Easy)**, **Computer (Hard)**, or **Human** for two players taking turns on one device. The side switch is hidden for two-player games. If you play O, the computer makes the opening move. The computer moves on its own about half a second after your turn.

Both choices are disabled while a game is in progress. You can change them on an empty board or once the game has ended. Changing either one starts a new game and resets the score to zero.

Against the computer the score shows **You**, **Opponent** and **Draws**. Two-player games show **X wins**, **O wins** and **Draws**.

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
  components/ThemeToggle.tsx  Light/dark switch (index.html applies the saved theme before first paint)
  components/ui/          shadcn/ui components (Button, Card, Label, NativeSelect, Switch)
  features/game/
    logic.ts              Pure game rules: winning lines, calculateWinner, isBoardFull
    ai.ts                 Pure computer strategies (perfect, tactical, random) and difficulty weights
    gameSlice.ts          Redux slice: board, current player, score, opponent, human side, game id;
                          forfeit notice; playMove (also restarts a finished game) / computerMove / resetGame /
                          setOpponent / setHumanPlayer
    selectors.ts          Derived state: winner, winning line, draw, game in progress, computer's turn,
                          status text, score labels
    useComputerTurn.ts    Hook that plays the computer's move after a short pause
    components/           Game, OpponentPicker, Board, Square, Status, ResetButton, Scoreboard
  test/                   Vitest setup and test helpers
```

Planning documents for this project live in `openspec/`.
