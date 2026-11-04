# Vibe-tac-slop

A tic-tac-toe game built to test development with [OpenSpec](https://openspec.dev/) and Claude Code.

Developed in reverse order compared to traditional development: first a simple react app implemeting a simple tic-tac-toe game was created, then the rest of the stack was progressively added.

## Tech stack
See also: [TECHSTACK.md](TECHSTACK.md)

### Front
- [shadcn/ui](https://ui.shadcn.com/) components
- Typescript
- React
- Redux
- Vite

### Back
- Python
- Django
- Postgres

### Tests
- Vitest

## Scripts

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm test`          | Run the frontend tests once (Vitest)                           |
| `npm run lint`      | Lint with Oxlint; warnings fail as well as errors              |
| `npm run typecheck` | Type-check the app and tooling projects (`tsc -b`)             |
| `uv run manage.py test` | Run the Django tests (needs PostgreSQL, see `.env.example`) |

## Continuous integration

Every push to any branch runs [.github/workflows/tests.yml](.github/workflows/tests.yml) on GitHub Actions: `npm run lint` (warnings fail), `npm run typecheck`, `npm test`, and `uv run manage.py test` against a temporary PostgreSQL. Results appear in the repository's Actions tab and as the status on each commit. A newer push to a branch cancels its unfinished run.

## Project layout

```
start-dev.sh              Starts the Vite and Django dev servers together
config/                   Django project: settings (read from .env), URLs
web/                      Django app: the page view and templates/web/index.html (page shell)
static/                   Django-owned static files (favicon.svg)
dist/                     Vite build output and manifest (git-ignored)
src/
  assets/                 Bundled assets (logo.svg)
  app/                    Redux store (makeStore) and typed hooks
  components/ThemeToggle.tsx  Light/dark switch (the page template applies the saved theme before first paint)
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
