#!/bin/bash

# Wait for database if necessary
# echo "Waiting for postgres..."
# while ! nc -z db 5432; do
#   sleep 0.1
# done
# echo "PostgreSQL started"

# Apply database migrations
python manage.py migrate

# Execute command passed to docker
exec "$@"
