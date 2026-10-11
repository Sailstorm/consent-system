-- Least-privilege role for the API server (security plan D-03).
--
-- The API only ever reads. Writes happen in the ASIC/OAIC importers, which
-- keep using the owner role (consent_app). Run on every boot by
-- infra/user_data.sh.tpl, after Postgres is healthy; idempotent, and it
-- resets the password so it always matches the current .env:
--
--   psql -v ON_ERROR_STOP=1 -v reader_password="$DB_READER_PASSWORD" \
--     -U consent_app -d consent_assistant -f database/roles.sql

SELECT format('CREATE ROLE consent_reader LOGIN PASSWORD %L', :'reader_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'consent_reader')
\gexec

SELECT format('ALTER ROLE consent_reader WITH LOGIN PASSWORD %L', :'reader_password')
\gexec

ALTER ROLE consent_reader SET default_transaction_read_only = on;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE consent_assistant TO consent_reader;
GRANT USAGE ON SCHEMA public TO consent_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO consent_reader;
ALTER DEFAULT PRIVILEGES FOR ROLE consent_app IN SCHEMA public
  GRANT SELECT ON TABLES TO consent_reader;
