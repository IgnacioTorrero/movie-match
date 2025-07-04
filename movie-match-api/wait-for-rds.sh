#!/bin/sh
set -e
host="database-1.c9w6gi8iyql1.eu-north-1.rds.amazonaws.com"
port=3306

echo "⏳ Esperando a MySQL en $host:$port..."

while ! nc -z $host $port; do
  sleep 2
done

echo "✅ MySQL en $host:$port está listo!"
exec "$@"
