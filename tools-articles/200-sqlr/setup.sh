#!/usr/bin/env bash
set -euo pipefail

DB_URL="https://github.com/jpwhite3/northwind-SQLite3/raw/main/dist/northwind.db"
DB_PATH="$(cd "$(dirname "$0")" && pwd)/northwind.db"

if [ ! -f "$DB_PATH" ]; then
  echo "Downloading Northwind database..."
  curl -sL -o "$DB_PATH" "$DB_URL"
else
  echo "Northwind database already present at $DB_PATH"
fi

sqlr add -n northwind -t sqlite -s "$DB_PATH"
sqlr set northwind

echo
echo "Northwind database downloaded. Connection added to sqlr and set as default."
echo "Run 'sqlr query \"SELECT * FROM Products LIMIT 5\"' to query the database."
