#!/usr/bin/env bash

## Instructions:
## You must have access to the Google akvo-lumen project and read access to the database.
set -eu

# Source the .env file to load variables into the current shell's environment
set -o allexport
source .env
set +o allexport

# Set up the necessary directories
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONFIG_DIR="${CURRENT_DIR}/.config/gcloud"
DUMP_DIR="${CURRENT_DIR}/db/dump"
for dir in "${CONFIG_DIR}" "${DUMP_DIR}"; do
  if [[ ! -d "${dir}" ]]; then
    mkdir -p "${dir}"
  fi
done

echo "Dump database from Cloud SQL"
make_dump_args=("${GCP_PROJECT}" "${GCP_SQL_INSTANCE}" "${GCP_SQL_DB_NAME}" "${GCP_SQL_EXPORT_BUCKET}" "/data")
docker run \
  --rm \
  -it \
  -v "$DUMP_DIR":/data \
  -v "$CONFIG_DIR":/root/.config/gcloud \
  -v "$CURRENT_DIR"/helper/make-gcp-dump.sh:/commands.sh:ro \
  gcr.io/google.com/cloudsdktool/google-cloud-cli bash /commands.sh "${make_dump_args[@]}"

echo "Shutting down containers"
docker compose down -v

echo "Waiting for containers to shut down..."
while [ "$(docker compose ps -q)" ]; do
  echo "Containers still running, waiting..."
  sleep 2
done
echo "All containers have been shut down."

echo "Start the db container only"
docker compose up -d db

echo "Waiting for database to be ready..."
until docker compose exec db pg_isready -U postgres; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready."

echo "Restore dumped database"
restore_args=("${DATABASE_NAME}" "${DATABASE_USERNAME}" "/data/dump/db_dump.gz")
docker-compose exec db /data/scripts/restore-from-dump.sh "${restore_args[@]}"

echo "Start all containers"
docker-compose up -d
