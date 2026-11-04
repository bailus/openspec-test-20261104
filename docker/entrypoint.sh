#!/bin/sh
# Container entrypoint: wait for the database, apply migrations, then run the given command.
set -e

timeout=${DB_WAIT_TIMEOUT:-60}
waited=0
until python manage.py shell -c 'from django.db import connection; connection.ensure_connection()' >/tmp/check.log 2>&1; do
  if [ "$waited" -ge "$timeout" ]; then
    echo "Database not reachable after ${timeout}s:" >&2
    cat /tmp/check.log >&2
    exit 1
  fi
  echo "Waiting for the database..."
  sleep 2
  waited=$((waited + 2))
done

python manage.py migrate --noinput
exec "$@"
