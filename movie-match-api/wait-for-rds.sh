#!/bin/sh

host="database-1.covqk2uks4dt.us-east-1.rds.amazonaws.com"
port=3306

echo "⏳ Waiting for MySQL in $host:$port..."

while ! nc -z $host $port; do
  sleep 2
done

echo "✅ MySQL in $host:$port is ready!"
exec "$@"
