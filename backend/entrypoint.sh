#!/bin/bash

# Wait for database
echo "Waiting for postgres..."
while ! python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.connect(('db', 5432))" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL started"

# Apply database migrations
python manage.py migrate

# Execute command passed to docker
exec "$@"
