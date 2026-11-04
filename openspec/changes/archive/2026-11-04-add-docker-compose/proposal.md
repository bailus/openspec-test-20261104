# Proposal

## Why

Vibe-tac-slop only runs through the two-process development setup in `start-dev.sh`. That setup needs uv, Node.js and a local PostgreSQL. There is no supported way to run it on a production server. With a `docker-compose.yml`, a server that has only Docker can run the whole app (production build, WSGI server and database) with `docker compose up`.

## What Changes

- Add a multi-stage `Dockerfile`. A Node stage builds the frontend with Vite. A Python stage installs the locked backend dependencies with uv, adds the built assets and runs `collectstatic`. The final image contains no Node.js, dev dependencies or secrets. It runs as a non-root user.
- Add `gunicorn` as a backend dependency and serve the app with it rather than `manage.py runserver`.
- Add `docker-compose.yml` with two services:
  - `web`: built from the Dockerfile. Runs in production mode (`DEBUG=False`), applies database migrations on start, then serves plain HTTP on host port 80 (overridable).
  - `db`: PostgreSQL 17 with a named volume, so data survives container rebuilds. It is not published on the host network.
- Read the production settings (`SECRET_KEY`, `ALLOWED_HOSTS`, `POSTGRES_PASSWORD`) from the `.env` file that Compose loads from the project directory. If any of them is missing, Compose refuses to start and names it.
- Add `.dockerignore` so local `.env`, `node_modules`, `.venv`, `dist`, `staticfiles` and `.git` stay out of the build context.
- Document the production setup and deploy commands in README, add the production variables to `.env.example`, and update TECHSTACK.md (container and hosting rows).

Development workflow (`start-dev.sh`) and game behaviour are unchanged.

## Capabilities

### New Capabilities
- `container-deployment`: Running the app in production from containers: the single command that starts it, the services it consists of, the configuration it requires, database persistence and migrations, and restart behaviour.

### Modified Capabilities
None. `app-server` already requires production mode to serve the built, hashed assets from the backend without a frontend dev server. The container setup meets that requirement and doesn't change it. Its database requirement (connection settings from the environment, not hard-coded) also stays as written.

## Out of scope

- HTTPS/TLS termination, domain or certificate management. The app is served over plain HTTP by choice.
- Publishing images to a registry or building them in CI. The image is built on the server from a checkout.
- Database backups, monitoring and multi-host orchestration.

## Impact

- **New files**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, a container entrypoint script.
- **Changed files**: `pyproject.toml` and `uv.lock` (gunicorn), `.env.example`, `README.md`, `TECHSTACK.md`.
- **New dependency**: `gunicorn` (Python). Base images `node` (LTS, build stage only), `python:3.13-slim` and `postgres:17`.
- **Systems**: the production server needs Docker Engine with the Compose plugin, a clone of the repository, and port 80 open. Docker isn't installed on the current development machine, so the container setup has to be verified on a machine that has it.
