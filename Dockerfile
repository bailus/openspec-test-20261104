# Stage 1: build the frontend (Vite writes dist/ with manifest.json).
FROM node:lts-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts components.json ./
COPY src ./src
RUN npm run build

# Stage 2: Python runtime with the locked backend dependencies and the built assets.
FROM python:3.13-slim AS runtime
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

COPY manage.py ./
COPY config ./config
COPY web ./web
COPY static ./static
COPY --from=frontend /build/dist ./dist
COPY docker/entrypoint.sh /entrypoint.sh

# Throwaway values for this command only; they are not stored in the image environment.
RUN SECRET_KEY=build-only DATABASE_URL=postgres://u:p@localhost/db \
    python manage.py collectstatic --noinput

RUN useradd --system --no-create-home app && chown -R app /app
USER app
EXPOSE 8000
ENTRYPOINT ["sh", "/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi", "--bind", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]
