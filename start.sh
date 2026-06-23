#!/bin/bash
set -e

echo "=== Migrate ==="
python manage.py migrate --noinput

echo "=== Static dosyalar toplanıyor ==="
python manage.py collectstatic --noinput

echo "=== Seed: demo verisi ==="
python manage.py seed_demo || true

echo "=== Seed: skill ekosistemi ==="
python manage.py seed_skills || true

echo "=== Seed: teknik dökümanlar ==="
python manage.py seed_docs || true

echo "=== Gunicorn başlatılıyor ==="
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  --workers 2 \
  --timeout 120
