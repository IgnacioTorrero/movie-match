#!/bin/sh

echo "⏳ Esperando a MySQL en mysql:3306..."
i=0
while ! nc -z -v -w30 mysql 3306 2>/dev/null
do
  i=$((i+3))
  printf "\r⏳ %ds esperando a MySQL..." "$i"
  sleep 3
done
echo ""
echo "✅ MySQL está listo."

echo "⏳ Esperando a Redis en redis:6379..."
i=0
while ! nc -z -v -w30 redis 6379 2>/dev/null
do
  i=$((i+3))
  printf "\r⏳ %ds esperando a Redis..." "$i"
  sleep 3
done
echo ""
echo "✅ Redis está listo."

echo "🚀 Arrancando app: $@"
exec "$@"
