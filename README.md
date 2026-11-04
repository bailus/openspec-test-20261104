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
- Docker Compose

### Tests
- Vitest
- Django (unittest)

## Scripts

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm test`          | Run the frontend tests once (Vitest)                           |
| `npm run lint`      | Lint with Oxlint; warnings fail as well as errors              |
| `npm run typecheck` | Type-check the app and tooling projects (`tsc -b`)             |
| `uv run manage.py test` | Run the Django tests (needs PostgreSQL, see `.env.example`) |

## Continuous integration

Every push to any branch runs [.github/workflows/tests.yml](.github/workflows/tests.yml) on GitHub Actions: `npm run lint` (warnings fail), `npm run typecheck`, `npm test`, and `uv run manage.py test` against a temporary PostgreSQL. Results appear in the repository's Actions tab and as the status on each commit. A newer push to a branch cancels its unfinished run.

## Production deployment (Docker)

The server needs only Docker Engine with the Compose plugin.

**First deploy**

```bash
git clone <repository-url> && cd <repository-directory>
printf 'SECRET_KEY=%s\nALLOWED_HOSTS=example.com\nPOSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" > .env
docker compose up -d --build
```

`SECRET_KEY`, `ALLOWED_HOSTS` and `POSTGRES_PASSWORD` are required; `docker compose up` refuses to start and names any that is missing. Optional: `APP_PORT` (host port, default 80) and `WEB_CONCURRENCY` (gunicorn workers, default 3). Compose sets `DEBUG=False` and `DATABASE_URL` itself, so those lines in `.env` are ignored. Keep passwords hex-only: the password is placed in a URL.

The app answers on port 80 once the database is ready. Migrations are applied automatically on every start.

**Update**: `git pull && docker compose up -d --build`

**Logs**: `docker compose logs -f web`

**Backup**: `docker compose exec db pg_dump -U vibetacslop vibetacslop > backup.sql`

**Rollback**: `git checkout <previous-commit> && docker compose up -d --build`. Migrations are not reversed automatically. To undo one, take a backup and run `docker compose exec web python manage.py migrate <app> <migration>` before checking out the older code.

Warnings:
- The app is served over **plain HTTP**. Logins (such as `/admin/`) are sent unencrypted; put a TLS-terminating proxy in front before relying on them.
- `docker compose down -v` **deletes the database volume**. Use plain `docker compose down` to stop.
- `POSTGRES_PASSWORD` only takes effect when the database volume is first created. To change it later, update `.env`, run `docker compose exec db psql -U vibetacslop -c "ALTER USER vibetacslop PASSWORD '<new-password>'"`, then `docker compose up -d`.

## Project layout

```
start-dev.sh              Starts the Vite and Django dev servers together
Dockerfile                Multi-stage image: builds the frontend, then the Django runtime
docker-compose.yml        Production stack: web (gunicorn) and db (PostgreSQL 17)
docker/entrypoint.sh      Container start: wait for the database, migrate, run the server
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
