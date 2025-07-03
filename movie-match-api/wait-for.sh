#!/bin/sh

echo "⏳ Esperando a MySQL en mysql:3306..."
until nc -z -v -w30 mysql 3306
do
  echo "⏳ Esperando a MySQL..."
  sleep 3
done

echo "✅ MySQL está listo."

echo "⏳ Esperando a Redis en redis:6379..."
until nc -z -v -w30 redis 6379
do
  echo "⏳ Esperando a Redis..."
  sleep 3
done

echo "✅ Redis está listo."

echo "🚀 Arrancando app: $@"
exec "$@"
