# Proposal

## Why

Vibe-tac-slop is a client-only Vite app with no server, so there is nowhere to keep data or add server-side features. Adding a Django backend on the local PostgreSQL server, with Django serving the React app as described in the [SaaS Pegasus Vite integration guide](https://www.saaspegasus.com/guides/modern-javascript-for-django-developers/integrating-javascript-pipeline-vite/#how-javascript-and-django-will-integrate), gives the project that foundation without losing Vite's hot module reloading during development.

## What Changes

- Add a Python/Django project at the repository root, managed with **uv** (`pyproject.toml` + `uv.lock`).
- Connect Django to the local PostgreSQL database `openspec20261104` (user `openspec20261104`) through settings read from the environment, with a committed `.env.example` and a git-ignored `.env`.
- Serve the React app from a Django view and template at `/`. **django-vite** inserts the script tags: in development they point at the Vite dev server (with HMR and React Fast Refresh); after a build they point at the hashed files listed in Vite's manifest, served by Django as static files.
- Reconfigure Vite as an asset pipeline for Django (`base` under the static URL, manifest output, dev-server origin), and move the page shell from `index.html` into the Django template. **BREAKING** (developer workflow): the app is now opened at the Django server (`http://localhost:8000`); `npm run dev` only runs the asset server alongside it, and `npm run preview` goes away.
- Move the favicon to Django static files and import the logo as a bundled asset so both load when the page is served by Django.
- Update README and TECHSTACK.md with the new prerequisites (uv, PostgreSQL) and the two-process development workflow.

Game behaviour is unchanged.

## Capabilities

### New Capabilities
- `app-server`: How the application is delivered by the backend server: which URL serves the app, how scripts and assets are loaded in development (live reload) and after a build, and how the server connects to its database.

### Modified Capabilities
None. The game, opponent and theme behaviour in `tic-tac-toe`, `computer-opponent` and `color-theme` stay as specified, including the theme being applied before first paint.

## Impact

- **New files**: `pyproject.toml`, `uv.lock`, `manage.py`, a Django project package and an app with the page view and template, `.env.example`, Django static files directory.
- **Changed files**: `vite.config.ts`, `package.json` scripts, `src/features/game/components/Game.tsx` (logo import), `src/components/ThemeToggle.tsx` (comment pointing at the template), `.gitignore`, `README.md`, `TECHSTACK.md`. `index.html` is removed; `public/` assets move.
- **New dependencies**: Python packages Django, django-vite, psycopg, django-environ and WhiteNoise; the uv tool itself (not currently installed on this machine).
- **Systems**: the local PostgreSQL 17 server. The role `openspec20261104` needs the `CREATEDB` privilege so Django's test runner can create its test database; a superuser has to grant it.
