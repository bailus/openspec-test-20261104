# Tasks

## 1. Backend dependency

- [x] 1.1 Add gunicorn with `uv add gunicorn` (updates `pyproject.toml` and `uv.lock`). Verify `uv sync --locked` succeeds, `uv run gunicorn --version` prints a version, and `uv run manage.py test` still passes.
- [x] 1.2 Add `gunicorn` to the Python dependencies table in TECHSTACK.md. Verify the row is present.

## 2. App image

- [x] 2.1 Add `.dockerignore` excluding `.git`, `.env`, `.env.*` (re-including `.env.example`), `node_modules`, `.venv`, `dist`, `staticfiles`, `__pycache__`, `openspec`, `.github`, `.claude` and `*.log`. Verify by inspection that every path listed in design.md is covered.
- [x] 2.2 Add `docker/entrypoint.sh` (POSIX sh, executable). It waits up to 60 s for `manage.py check --database default` to pass, runs `migrate --noinput`, then `exec "$@"`. Verify with `sh -n docker/entrypoint.sh`. Also run it locally against the dev database: `DEBUG=False uv run sh docker/entrypoint.sh echo started` should migrate and print `started`. With `DATABASE_URL` pointing at an unreachable host, it should exit non-zero after the timeout.
- [x] 2.3 Add the multi-stage `Dockerfile` described in design.md: `frontend` stage (`node:lts-slim`, `npm ci`, `npm run build`), then `runtime` stage (`python:3.13-slim`, uv from `ghcr.io/astral-sh/uv`, `uv sync --locked --no-dev --no-install-project`, backend source plus `dist/`, `collectstatic` with inline throwaway env, non-root `app` user, `PYTHONUNBUFFERED=1`, `ENTRYPOINT` the script, `CMD` gunicorn binding `0.0.0.0:8000` with access and error logs to `-`). On a Docker machine, verify that `docker build -t vibe-tac-slop .` succeeds and that `docker run --rm vibe-tac-slop sh -c 'id -un; ls /app/staticfiles; test ! -e /app/.env'` prints `app`, lists the hashed assets and exits 0.

## 3. Compose stack and configuration

- [x] 3.1 Add `docker-compose.yml` with the `db` and `web` services from design.md: postgres:17 with the `pgdata` volume and `pg_isready` healthcheck, no `db` ports, `restart: unless-stopped` on both, `${APP_PORT:-80}:8000`, fixed `DEBUG: "False"`, and `:?` interpolation for `SECRET_KEY`, `ALLOWED_HOSTS` and `POSTGRES_PASSWORD`. Verify that `docker compose config` renders with those variables set. With `POSTGRES_PASSWORD` unset, it should fail and name the variable.
- [x] 3.2 Add a commented "Production (docker compose)" block to `.env.example`. It documents `SECRET_KEY`, `ALLOWED_HOSTS`, `POSTGRES_PASSWORD`, `APP_PORT` and `WEB_CONCURRENCY`, generating hex-only values with `openssl rand -hex 32`, and that `DEBUG`/`DATABASE_URL` are ignored under Compose. Verify that `cp .env.example .env.tmp` still gives a working dev configuration (the block is all comments) and `uv run manage.py check` passes with it. Then remove `.env.tmp`.
- [x] 3.3 Add a "Production deployment (Docker)" section to README. Cover prerequisites (Docker Engine and the Compose plugin), first deploy (clone, create `.env`, `docker compose up -d --build`), updating (`git pull && docker compose up -d --build`), logs (`docker compose logs -f web`), backups (`docker compose exec db pg_dump …`) and rollback. Include the warnings about plain HTTP, `docker compose down -v` deleting data, and `POSTGRES_PASSWORD` only applying on first init (with the `ALTER USER` fix). Add `Dockerfile`, `docker-compose.yml` and `docker/` to the project layout block. Verify the commands match the files exactly.
- [x] 3.4 Update TECHSTACK.md: the Hosting/deployment and Operating system/container rows (Docker Compose, `python:3.13-slim`, `postgres:17`, gunicorn, WhiteNoise) and the Infrastructure as Code row. Verify no row still says no container is specified.

## 4. End-to-end verification (on a machine with Docker)

- [x] 4.1 Fresh start: from a clean clone with a production `.env` (`ALLOWED_HOSTS=localhost`), run `docker compose up -d --build`. Verify `curl -i http://localhost/` returns 200 with `<title>Vibe-tac-slop</title>`, every `/static/` asset referenced by the page returns 200, the game board renders in a browser, and `docker compose exec web python manage.py migrate --check` exits 0.
- [x] 4.2 Production behaviour: verify `curl -i http://localhost/nope` returns a plain 404 without debug output, `curl -i -H 'Host: other.test' http://localhost/` returns 400, and `docker compose logs web` shows the gunicorn startup and access log lines.
- [x] 4.3 Isolation and configuration: verify `docker compose port db 5432` reports no published port and nothing on the host listens on 5432 for this stack. With `APP_PORT=8080`, the app answers on 8080 and not on 80. Removing `SECRET_KEY` from `.env` makes `docker compose up` fail and name it.
- [x] 4.4 Persistence and restart: create a superuser with `docker compose exec web python manage.py createsuperuser`, run `docker compose down && docker compose up -d --build`, and verify the user still exists. Kill gunicorn (`docker compose kill -s KILL web`, then confirm Docker restarts it via `docker compose ps`), and restart the Docker daemon (or reboot). Verify `/` returns 200 again without manual action.
