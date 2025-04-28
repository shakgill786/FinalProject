#!/bin/bash

echo "⚡ Resetting database and reseeding..."

# Step 1: Delete old dev.db
if [ -f "instance/dev.db" ]; then
  echo "🗑️ Deleting existing dev.db..."
  rm instance/dev.db
fi

# Step 2: Re-run migrations
echo "🔧 Running migrations..."
flask db upgrade

# Step 3: Seed the database
echo "🌱 Seeding database..."
python -m app.seeds.seed

echo "✅ Database reset and reseeded successfully!"
