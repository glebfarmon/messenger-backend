#!/bin/sh
set -e

until nc -z ${POSTGRES_HOST:-postgres} ${DB_PORT:-5432}; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is up - executing migrations"
npx prisma migrate deploy

echo "Starting the application..."
exec "$@"