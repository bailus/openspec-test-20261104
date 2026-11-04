# Tasks

## 1. Tooling and Python project setup

- [x] 1.1 Install uv with Astral's standalone installer into `~/.local/bin` and verify `uv --version` prints a version
- [x] 1.2 Create `pyproject.toml` (`requires-python = ">=3.13"`, `[tool.uv] package = false`) and `uv add django django-vite "psycopg[binary]" django-environ whitenoise`; verify `uv.lock` exists and `uv run python -c "import django, django_vite, psycopg, environ, whitenoise"` succeeds
- [x] 1.3 Add `.venv/`, `__pycache__/`, `*.pyc`, `.env` and `staticfiles/` to `.gitignore` and verify `git status` does not list `.venv/`
- [x] 1.4 Add uv and PostgreSQL to the README prerequisites, with the `uv sync` install step; verify `uv sync` runs as written

## 2. Django project and database

- [x] 2.1 Generate the `config` project at the repo root with `uv run django-admin startproject config .` and verify `manage.py` and `config/settings.py` exist
- [x] 2.2 Rework `config/settings.py` to read `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS` and `DATABASE_URL` from `.env` via django-environ (no fallback key when `DEBUG` is false); commit `.env.example` with the local `openspec20261104` URL, `DEBUG=True`, `ALLOWED_HOSTS=localhost,127.0.0.1` and a development-only `SECRET_KEY`, copy it to `.env`, and verify `uv run manage.py check --database default` passes
- [x] 2.3 Run `uv run manage.py migrate` and verify `uv run manage.py showmigrations` lists every migration as applied in the `openspec20261104` database
- [x] 2.4 Set `DATABASE_URL` with a wrong password in the environment and verify `uv run manage.py migrate` fails with a connection error naming the authentication failure
- [x] 2.5 Ask the user to grant `CREATEDB` (`sudo -u postgres psql -c 'ALTER ROLE openspec20261104 CREATEDB'`) and verify `psql` shows `rolcreatedb = t` for the role
- [x] 2.6 Document `.env` setup (copy `.env.example`) and `uv run manage.py migrate` in the README; verify both commands run as written

## 3. Serve the React app from Django with django-vite

- [x] 3.1 Update `vite.config.ts` (`base: '/static/'`, `build.manifest: 'manifest.json'`, `build.outDir: 'dist'`, `build.rolldownOptions.input: 'src/main.tsx'`, `server.origin: 'http://localhost:5173'`, `publicDir: false`) and remove the `preview` script from `package.json`; verify `npm run build` writes `dist/manifest.json` with an entry for `src/main.tsx` and prints no deprecation warning
- [x] 3.2 Move `public/logo.svg` to `src/assets/logo.svg`, import it in `Game.tsx`, move `public/favicon.svg` to `static/favicon.svg`, and remove `public/`; verify `npm test`, `npm run lint` and `npm run build` pass
- [x] 3.3 Add `django_vite`, the `web` app, WhiteNoise middleware, `STATIC_URL`/`STATIC_ROOT`, `STATICFILES_DIRS` (`static/`, plus `dist/` only when it exists) and `DJANGO_VITE` (dev mode follows `DEBUG`, forced on under `manage.py test`, manifest at `dist/manifest.json`) to settings; verify `uv run manage.py check` passes with no `staticfiles.W004` warning both with and without `dist/`
- [x] 3.4 Create `web/templates/web/index.html` from `index.html` (title, `{% static 'favicon.svg' %}`, the inline theme script unchanged, `vite_hmr_client`, `vite_react_refresh`, `vite_asset 'src/main.tsx'`), add the view and the `/` route, delete `index.html`, and update the "keep in step" comments in `ThemeToggle.tsx` and the template; verify `curl -s localhost:8000/` returns the page with the Vite client script while `runserver` runs
- [x] 3.5 Write `web/tests.py` covering: `/` returns 200 with the title, favicon link and theme script before any module script; it references `@vite/client` and `src/main.tsx` on `localhost:5173`; verify `uv run manage.py test` passes with `DEBUG=True` and with `DEBUG=False` in `.env`, and with no `dist/` present
- [x] 3.6 Update the README: the two-process dev workflow at `http://localhost:8000`, the production-style run (`npm run build`, `collectstatic`, `DEBUG=False runserver`), `uv run manage.py test`, the scripts table without `preview`, and the new project layout; verify each documented command runs as written

## 4. Tech stack inventory

- [x] 4.1 Update `TECHSTACK.md` with the Python/Django stack, uv and `uv.lock`, PostgreSQL, and the backend/data-store rows; verify it no longer says no backend or database is declared

## 5. Integration checks

- [x] 5.1 With `npm run dev` and `uv run manage.py runserver` running, open `http://localhost:8000`, play a move, edit a component's text and a stylesheet, and verify both changes appear without a full reload and the board keeps its moves; verify the favicon, logo and saved dark theme (no light flash) work
- [x] 5.2 Stop Vite, run `npm run build` and `uv run manage.py collectstatic --noinput`, start `DEBUG=False uv run manage.py runserver`, and verify `/` plus every script, style, favicon and logo URL it references return 200 from port 8000 and the game plays
- [x] 5.3 Stop the server, move `dist/manifest.json` aside, start `DEBUG=False uv run manage.py runserver` again, and verify `/` returns 500 and the server log names the missing manifest; then restore the manifest
- [x] 5.4 Run the full suite — `npm test`, `npm run lint`, `npm run build`, `uv run manage.py test`, `openspec validate add-django-backend --strict` — and verify all pass

## Workflow follow-up

- Archive the change with `/opsx:archive` after review, syncing the new `app-server` spec into `openspec/specs/`.
