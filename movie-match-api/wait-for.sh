#!/bin/sh

echo "⏳ Waiting for MySQL in mysql:3306..."
i=0
while ! nc -z -v -w30 mysql 3306 2>/dev/null
do
  i=$((i+3))
  printf "\r⏳ %ds waiting for MySQL..." "$i"
  sleep 3
done
echo ""
echo "✅ MySQL is ready."

echo "⏳ Waiting for Redis in redis:6379..."
i=0
while ! nc -z -v -w30 redis 6379 2>/dev/null
do
  i=$((i+3))
  printf "\r⏳ %ds waiting for Redis..." "$i"
  sleep 3
done
echo ""
echo "✅ Redis is ready."

echo "🚀 Starting app: $@"
exec "$@"
