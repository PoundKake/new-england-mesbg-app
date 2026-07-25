-- Creates (or updates) a named admin account. Not part of db/migrations —
-- migrations auto-run on first container init, and baking a real password
-- into a committed file would leak it into git history. Run this by hand
-- whenever a new organizer needs admin access, or to rotate a password.
--
-- Usage (from the machine running docker compose, so it can reach the db
-- service):
--
--   docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
--     -v username="'alice'" \
--     -v display_name="'Alice Admin'" \
--     -v password="'choose-a-strong-password'" \
--     -f - < db/scripts/create_admin.sql
--
-- Re-running with the same username updates that admin's display name and
-- password instead of creating a duplicate account.

insert into api.admins (username, display_name, password_hash)
values (:username, :display_name, crypt(:password, gen_salt('bf')))
on conflict (username) do update
  set display_name  = excluded.display_name,
      password_hash = excluded.password_hash;
