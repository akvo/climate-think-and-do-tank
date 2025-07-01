#!/usr/bin/env bash

set -eu

DB_NAME="${1}"
DB_USER="${2}"
DUMP_FILE="${3}"

psql_settings=("--username=postgres" "--dbname=${DB_NAME}" "--set" "ON_ERROR_STOP=on")

psql "${psql_settings[@]}" --command="DROP SCHEMA public CASCADE"
psql "${psql_settings[@]}" --command="CREATE SCHEMA public"
gunzip --stdout "${DUMP_FILE}" \
  | sed -e "/^REVOKE\ /d" \
  | sed -e "/^GRANT\ /d" \
  | sed -e "/ALTER DEFAULT PRIVILEGES FOR ROLE postgres/d" \
  | psql "${psql_settings[@]}"

echo "Setting the owner of public tables to ${DB_USER}"
echo "
  select
    'Alter table '||t.schemaname||'.'||t.tablename ||' owner to ${DB_USER};'
  from pg_tables t
  where schemaname='public';
" | psql "${psql_settings[@]}" \
  | grep Alter \
  | psql "${psql_settings[@]}"

echo "Setting the owner of public views to ${DB_USER}"
echo "
  select
    'Alter view '||v.schemaname||'.'||v.viewname ||' owner to ${DB_USER};'
  from pg_views v
  where schemaname='public';
" | psql "${psql_settings[@]}" \
  | grep Alter \
  | psql "${psql_settings[@]}"

echo "Granting access to all current and future public tables+sequences for user ${DB_USER}"
echo "GRANT ALL ON schema public TO ${DB_USER};" | psql "${psql_settings[@]}"
echo "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};" | psql "${psql_settings[@]}"
echo "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${DB_USER};" | psql "${psql_settings[@]}"
