#!/usr/bin/env bash

app_wrangler_toml="./apps/app/wrangler.toml"

# Check if wrangler is installed
if ! [ -x "$(command -v wrangler)" ]; then
  echo -e 'Wrangler is not installed. Please run "npm i -g wrangler"'
  exit 1
fi

# Execute the latest migration script
latest_migration=$(ls ./packages/db/src/migrations/*.sql | sort -V | tail -n 1)
if wrangler d1 execute blade --local --file "$latest_migration" --config "$app_wrangler_toml" 2>&1 | grep -q 'SQLITE_ERROR'; then
  echo -e 'Database has already been migrated using' "$latest_migration"
else
  echo -e "Database has been migrated using" "$latest_migration"
fi

# Check if sqlite file exists in apps/app directory
sqlite_file=$(find ./apps/app -name "*.sqlite" -type f -print -quit)
if find ./apps/app -name "*.sqlite" -type f -print -quit | grep -q .; then
  echo "LOCAL_DATABASE_URL=../../$sqlite_file"
else
  echo "No SQLite file found."
fi
