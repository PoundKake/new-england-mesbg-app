#!/bin/bash
# Creates the Postgres roles PostgREST authenticates as. This is a shell
# script (not plain SQL) specifically so it can read AUTHENTICATOR_PASSWORD
# from the environment at container init time — a .sql file in
# docker-entrypoint-initdb.d has no env var substitution, and committing a
# real password into a migration file would leak it into git history.
set -euo pipefail

: "${AUTHENTICATOR_PASSWORD:?AUTHENTICATOR_PASSWORD must be set (see .env.example)}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- authenticator: the only role PostgREST itself logs in as. It has no
  -- privileges of its own (noinherit) — every request switches to either
  -- web_anon or web_admin per PGRST_DB_ANON_ROLE / the request's JWT "role"
  -- claim.
  create role authenticator noinherit login password '${AUTHENTICATOR_PASSWORD}';

  -- web_anon: unauthenticated requests. Read-only (grants added in
  -- 0005_grants_and_rls.sql).
  create role web_anon nologin;

  -- web_admin: requests carrying a valid admin JWT. Can write results/photos
  -- (grants added in 0005_grants_and_rls.sql).
  create role web_admin nologin;

  grant web_anon to authenticator;
  grant web_admin to authenticator;
EOSQL
