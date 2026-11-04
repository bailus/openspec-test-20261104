# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- The app is a Vite 8 + React 19 + TypeScript project at the repository root. `index.html` is the page shell: it sets the title and favicon and runs an inline script that applies the saved or system theme before first paint (`src/components/ThemeToggle.tsx` refers to it). The entry module is `src/main.tsx`.
- `public/` holds `favicon.svg` (linked from `index.html`) and `logo.svg` (used as `<img src="/logo.svg">` in `src/features/game/components/Game.tsx`). Both are root-absolute URLs that break once the page comes from Django and assets live under `/static/`.
- `dist/` is already git-ignored. Vitest, oxlint and `tsc -b` run over `src/` and must keep working.
- Python 3.13.5 is installed; **uv is not**. PostgreSQL 17 runs locally; the role `openspec20261104` can log in to its empty database but lacks `CREATEDB`. The user has agreed to grant it so tests run against Postgres.
- The target integration is the SaaS Pegasus guide linked from the proposal: Django renders the page, django-vite emits Vite script tags, Vite serves modules with HMR in development and writes a manifest for production.

## Goals / Non-Goals

**Goals:**
- One page, served by Django at `/`, that behaves exactly like today's app.
- Fast development: Vite HMR and React Fast Refresh through the Django-served page.
- A production-style mode (`DEBUG=False`) where Django alone serves the page and built assets.
- Postgres connection configured from the environment; migrations run cleanly.

**Non-Goals:**
- No API endpoints, models, or moving game state to the server.
- No authentication beyond Django's default contrib apps.
- No deployment target, container, or process manager; no production-grade secrets management.
- No Python linter/formatter setup.

## Decisions

### Repository layout: Django at the root, frontend stays in `src/`
```
pyproject.toml, uv.lock, manage.py, .env.example
config/            settings.py, urls.py, wsgi.py, asgi.py
web/               Django app: views.py, urls.py, tests.py, templates/web/index.html
static/            favicon.svg (Django-owned static files)
src/               React app, unchanged apart from the logo import
dist/              Vite build output + manifest (git-ignored)
staticfiles/       collectstatic output (git-ignored)
```
Keeping `src/`, `package.json` and the TypeScript/shadcn configs where they are avoids touching every alias, test and tool config. The alternative — a separate `frontend/` or `backend/` subtree — means churn across `tsconfig*`, `components.json` and the README for no behavioural gain. The project package is named `config` and the app `web`, avoiding a clash with the `src` directory and with Python's `site`/`app` names.

### uv manages Python, as a non-packaged project
`pyproject.toml` declares the dependencies and `requires-python = ">=3.13"`; `[tool.uv] package = false` because this is an application, not a library. Every Python command runs through `uv run` (e.g. `uv run manage.py runserver`), so nobody has to activate `.venv`. uv is installed with Astral's standalone installer into `~/.local/bin`, which is already on `PATH` (node lives there).

Dependencies: `django`, `django-vite`, `psycopg[binary]` (psycopg 3), `django-environ`, `whitenoise`. Versions are whatever `uv add` resolves today and are pinned by `uv.lock`.

### Settings from the environment with django-environ
`config/settings.py` reads `.env` (git-ignored) via django-environ: `DATABASE_URL`, `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`. `.env.example` is committed with
`DATABASE_URL=postgres://openspec20261104:openspec@localhost:5432/openspec20261104`, `DEBUG=True`, `ALLOWED_HOSTS=localhost,127.0.0.1` and a development-only `SECRET_KEY`, so the same `.env` also works for a local `DEBUG=False` run. Settings refuse to load without a `SECRET_KEY` when `DEBUG` is false; there is no hard-coded fallback key. Variables already set in the process environment override `.env` (django-environ does not overwrite them), which is how `DEBUG=False uv run ...` switches mode. Alternatives: `dj-database-url` + `python-dotenv` (two packages for the same job) or hard-coded `DATABASES` (rejected: credentials in source).

### django-vite with Vite as Django's asset pipeline
Following the guide:

- **vite.config.ts**: `base: '/static/'`, `build.manifest: 'manifest.json'`, `build.outDir: 'dist'`, `build.rolldownOptions.input: 'src/main.tsx'` (Vite 8 bundles with Rolldown; `rollupOptions` is a deprecated alias), `server.origin: 'http://localhost:5173'`, `publicDir: false`. The React, Tailwind, `@` alias and Vitest settings stay.
- **settings**: `DJANGO_VITE = {"default": {"dev_mode": DEBUG, "manifest_path": BASE_DIR / "dist/manifest.json"}}`; `STATIC_URL = "/static/"`; `STATICFILES_DIRS = [BASE_DIR / "static"]` plus `BASE_DIR / "dist"` only when that directory exists (otherwise `manage.py check` warns `staticfiles.W004` on every run before the first build); `STATIC_ROOT = BASE_DIR / "staticfiles"`.
- **template** `web/templates/web/index.html`: the current `index.html` contents, with the inline theme script kept verbatim in `<head>`, `{% static 'favicon.svg' %}` for the icon, then `{% vite_hmr_client %}`, `{% vite_react_refresh %}` and `{% vite_asset 'src/main.tsx' %}`.
- **view/URL**: `web.views.index` renders the template (a `TemplateView` is enough) at `/`. `/admin/` stays from the default project.

In dev mode django-vite emits `http://localhost:5173/static/@vite/client`, the React refresh preamble and `http://localhost:5173/static/src/main.tsx`. CSS is imported by `main.tsx`, so Vite injects it in dev and the manifest lists it for production. `server.origin` makes asset URLs inside modules (e.g. the imported logo) point at the Vite server rather than Django.

Alternative considered: Django serving Vite's built `index.html` as a template. Rejected: no HMR through Django and fragile string-rewriting of asset paths.

### Static assets: favicon to Django, logo into the bundle
`public/favicon.svg` → `static/favicon.svg` (Django owns the page head). `public/logo.svg` → `src/assets/logo.svg`, imported in `Game.tsx` (`import logoUrl from '@/assets/logo.svg'`) so Vite fingerprints it and resolves the right URL in both modes. `public/` is then empty and removed, hence `publicDir: false`. Alternative: add `public/` to `STATICFILES_DIRS` and use `/static/logo.svg` — works, but splits one asset across two pipelines and hard-codes the static prefix in React.

### WhiteNoise serves static files when `DEBUG=False`
`runserver` only serves static files in debug mode. WhiteNoise middleware lets Django itself serve `staticfiles/` with correct caching, which is what "served by Django" needs outside development, without adding nginx. Default storage is used (Vite already content-hashes bundle names).

### Developer workflow
- Development: `npm run dev` (Vite on :5173) **and** `uv run manage.py runserver` (Django on :8000); open `http://localhost:8000`.
- Production-style: `npm run build`, `uv run manage.py collectstatic --noinput`, then `DEBUG=False uv run manage.py runserver`.
- `index.html` is deleted; `npm run preview` is removed from `package.json` since there is no standalone page to preview. `npm run build`, `test` and `lint` are unchanged.

### Tests
- Django tests in `web/tests.py`, run with `uv run manage.py test` against Postgres (needs `CREATEDB`). They cover: `/` returns 200 with the title, favicon link and theme script; in dev mode the page references the Vite client and `src/main.tsx` on the dev server; and `manage.py check --database default` passes.
- The test runner always sets `DEBUG=False`, but django-vite reads `dev_mode` once at settings load, from `.env`. To keep tests independent of a developer's `.env`, settings force `DJANGO_VITE["default"]["dev_mode"] = True` when running under `manage.py test` (detected via `sys.argv`), so tests never need a build.
- django-vite caches its loader and manifest as a singleton, so a production-mode test would need to reset it. Instead, production mode is verified end-to-end by building, collecting static files and fetching the page and every referenced asset with `curl`. For the same reason, checking the missing-manifest behaviour needs a server restart after the manifest is moved.
- Existing Vitest suites must stay green; Vitest resolves the SVG import to a path string, so `Game` tests need no change.

## Risks / Trade-offs

- [Role lacks `CREATEDB`, so `manage.py test` fails] → Implementation pauses and asks the user to run `sudo -u postgres psql -c 'ALTER ROLE openspec20261104 CREATEDB'`; the user has agreed to this.
- [Two processes in development; forgetting `npm run dev` gives a blank page with failed script loads] → README documents both; the template could later show a hint, but that is not in scope.
- [Cross-origin module loading from :5173 into a :8000 page] → Vite's default dev CORS policy allows `localhost` origins; if blocked, set `server.cors` to the Django origin.
- [Inline theme script now lives in a Django template, away from `ThemeToggle.tsx`] → Update the "keep in step" comments in both places to name the template path.
- [Installing uv changes the machine's toolchain] → User-scoped install under `~/.local/bin`, no system packages touched.
- [`.env` with a real password] → Git-ignored; only `.env.example` is committed, and this is a local development database. The `SECRET_KEY` in `.env.example` is public and for local use only.
- [`collectstatic` copies Vite's `manifest.json` to `/static/manifest.json`, publishing the list of built file names] → Accepted: it holds only hashed asset paths that the page already references; nothing secret.
- [With `DEBUG=False` a missing build shows only Django's generic 500 page] → The traceback naming the manifest goes to the server log; README tells developers to run `npm run build` before a production-style run.

## Migration Plan

Additive for users; only the developer workflow changes. Rollback is reverting the commit: `index.html`, `public/` and the old `vite.config.ts` return, and the empty Django tables in `openspec20261104` can be left or dropped.
