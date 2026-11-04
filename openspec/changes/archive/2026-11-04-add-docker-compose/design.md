# Design

## Context

See proposal.md for motivation. Relevant current state:

- `config/settings.py` reads every setting through django-environ. Process environment variables override `BASE_DIR/.env`. `SECRET_KEY` and `DATABASE_URL` have no defaults, so settings won't load without them, even for `collectstatic`.
- `STATICFILES_DIRS` includes `dist/` only if it exists when settings load. With `DEBUG=False`, django-vite reads `dist/manifest.json` at runtime, so `dist/` has to be in the runtime image as well as collected into `STATIC_ROOT`.
- WhiteNoise middleware is already installed and serves `STATIC_ROOT` when `DEBUG=False`.
- `npm run build` runs `tsc -b && vite build` and needs devDependencies (TypeScript, Vite, plugins).
- There's no WSGI server dependency. Development uses `manage.py runserver`.
- Docker isn't installed on the development machine.

## Goals / Non-Goals

**Goals:**
- A small runtime image that is reproducible from the lockfiles: Python, the locked runtime dependencies, the app code and the built assets.
- Production settings come only from the environment that Compose provides. The app code doesn't change.
- `docker compose up` on a fresh clone with a `.env` is the whole deployment.

**Non-Goals:**
- Using containers for local development. `start-dev.sh` stays the dev workflow.
- Production-only Django settings modules or HTTPS hardening settings (`SECURE_*`, secure cookies). These belong with a future TLS change.
- A CI job that builds the image or smoke-tests the stack.

## Decisions

### Multi-stage Dockerfile at the repository root
1. **`frontend` stage** (`node:lts-slim`): copy `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts` and `src/`. Run `npm ci` then `npm run build`, which produces `dist/` with `manifest.json`. Using `npm run build` keeps the type-check in the image build, the same as CI.
2. **`runtime` stage** (`python:3.13-slim`): copy the `uv` binary from `ghcr.io/astral-sh/uv`. Run `uv sync --locked --no-dev --no-install-project` into `/app/.venv` (copy `pyproject.toml` and `uv.lock` first so this layer caches). Copy the backend source (`manage.py`, `config/`, `web/`, `static/`) and `dist/` from the frontend stage. Then run `collectstatic --noinput` with throwaway `SECRET_KEY`/`DATABASE_URL` values set inline on that `RUN` line only. `collectstatic` doesn't connect to the database, and inline variables don't persist into the image's environment.
3. Create a non-root `app` user, make it own `/app`, and switch to it. Add `/app/.venv/bin` to `PATH`. Set `PYTHONUNBUFFERED=1` so logs aren't buffered. Expose port 8000.

*Alternatives:* a single stage with Node and Python (much larger image, with build tools at runtime). Building `dist/` on the host and copying it in (needs Node on the server, which defeats the goal).

### gunicorn as the WSGI server
Add `gunicorn` to `pyproject.toml` with `uv add gunicorn`, which also updates `uv.lock`. Run `gunicorn config.wsgi --bind 0.0.0.0:8000 --access-logfile - --error-logfile -` so both logs go to stdout and stderr. gunicorn reads the worker count from `WEB_CONCURRENCY`, defaulting to 1. Compose sets it to 3 by default, and the operator can override it.

*Alternatives:* uvicorn/ASGI (no async code exists, so there's no benefit). `runserver` (Django documents it as unfit for production).

### Entrypoint script: wait, migrate, exec
`docker/entrypoint.sh` (POSIX sh, `set -e`):
1. Wait for the database. Retry `python manage.py check --database default` every 2 s for up to 60 s, then exit non-zero with the last error.
2. `python manage.py migrate --noinput`.
3. `exec "$@"`, where the image's `CMD` is the gunicorn command. That makes gunicorn PID 1 and lets it receive `docker stop` signals.

Compose's `depends_on: condition: service_healthy` handles ordering on `docker compose up`. When the Docker daemon restarts containers after a reboot, it ignores `depends_on`, so the wait loop in the entrypoint is what covers that case. Running migrations in the entrypoint is safe here because there's only one `web` container.

*Alternative:* a separate one-shot `migrate` service. It's more moving parts, and the daemon doesn't re-run it after a reboot in any guaranteed order.

### docker-compose.yml
- `db`: `postgres:17`. Environment: `POSTGRES_DB=vibetacslop`, `POSTGRES_USER=vibetacslop`, `POSTGRES_PASSWORD=${POSTGRES_PASSWORD:?…}`. Data in the named volume `pgdata` at `/var/lib/postgresql/data`. Healthcheck `pg_isready -U vibetacslop -d vibetacslop`. **No `ports:`**, so it's reachable only on the Compose network. `restart: unless-stopped`.
- `web`: `build: .`, `restart: unless-stopped`, `depends_on: db: condition: service_healthy`, `ports: ["${APP_PORT:-80}:8000"]`. Environment:
  - `DEBUG: "False"` (fixed, not interpolated, so a dev `.env` can't turn it on)
  - `SECRET_KEY: ${SECRET_KEY:?SECRET_KEY must be set in .env}`
  - `ALLOWED_HOSTS: ${ALLOWED_HOSTS:?ALLOWED_HOSTS must be set in .env}`
  - `DATABASE_URL: postgres://vibetacslop:${POSTGRES_PASSWORD:?…}@db:5432/vibetacslop`
  - `WEB_CONCURRENCY: ${WEB_CONCURRENCY:-3}`

  The `:?` interpolation is what makes Compose refuse to start, with a message naming the variable, when a required setting is missing or empty.

### Configuration lives in the project `.env`
Compose automatically reads `.env` in the project directory for interpolation. On the server, the operator creates `.env` with `SECRET_KEY`, `ALLOWED_HOSTS` and `POSTGRES_PASSWORD` (and optionally `APP_PORT` and `WEB_CONCURRENCY`). The file is already git-ignored. `.dockerignore` excludes it from the build context, so it never ends up in the image. It reaches the container only as the explicit `environment:` entries above. `DEBUG` and `DATABASE_URL` lines in that `.env` (for example, ones copied from `.env.example`) are ignored, because Compose sets those two explicitly. `.env.example` gains a commented "Production (docker compose)" block documenting the extra variables and how to generate values (`openssl rand -hex 32`).

*Alternative:* a separate `production.env` passed with `--env-file`. That breaks the plain `docker compose up` goal.

### .dockerignore
Exclude `.git`, `.env`, `.env.*` (re-include `.env.example`), `node_modules`, `.venv`, `dist`, `staticfiles`, `__pycache__`, `openspec`, `.github`, `.claude`, `*.log`. This keeps the context small and stops host builds from leaking into the image.

## Risks / Trade-offs

- [Plain HTTP: admin login and session cookies travel unencrypted] → Documented in README as a known limitation, with the recommendation to put a TLS-terminating proxy in front before using `/admin/`. TLS is a later change.
- [`POSTGRES_PASSWORD` only takes effect when the volume is first initialised; changing it later breaks the connection] → README says so and gives the `ALTER USER` steps.
- [The password goes into a URL, so characters like `@`, `/` and `:` would break `DATABASE_URL`] → Document hex-only generation (`openssl rand -hex 32`).
- [`docker compose down -v` deletes the database volume] → README warns about it next to the update and stop commands.
- [Building on the server needs RAM and CPU for `npm ci` and `tsc`] → Acceptable for this app's size. Prebuilt registry images are a possible follow-up.
- [It hasn't been verified on the development machine (no Docker)] → The verification tasks have to run on a machine with Docker. The rest of the work is config and docs, and the existing Django and CI tests still cover the app.

## Migration Plan

First deployment: install Docker Engine with the Compose plugin on the server, `git clone`, create `.env` from the documented variables, then `docker compose up -d --build`.

Updates: `git pull && docker compose up -d --build`. Migrations run on start.

Rollback: `git checkout <previous-commit> && docker compose up -d --build`. Migrations aren't reversed automatically. If a migration has to be undone, run `docker compose exec web python manage.py migrate <app> <migration>` before checking out the older code. Back up first with `docker compose exec db pg_dump`.
