
-- Create users
-- https://samkhawase.com/blog/postgrest/postgresql_db_and_entities/
CREATE ROLE api_anon nologin;
CREATE ROLE authenticator WITH NOINHERIT LOGIN PASSWORD 'password';
GRANT api_anon TO authenticator;

-- https://dba.stackexchange.com/questions/33943/granting-access-to-all-tables-for-a-user
GRANT ALL on SCHEMA bitcoin to api_anon;
GRANT ALL ON ALL TABLES IN SCHEMA bitcoin TO api_anon;