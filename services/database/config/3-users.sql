--##
--# Copyright ©️ Marcello DeSales - All Rights Reserved
--# Unauthorized copying of this file, via any medium is strictly prohibited
--# Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
--# Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
--##

-- Create users for the PostGREST API and protect the server. Allowing it all open for testing

-- https://samkhawase.com/blog/postgrest/postgresql_db_and_entities/
CREATE ROLE api_anon nologin;
CREATE ROLE authenticator WITH NOINHERIT LOGIN PASSWORD 'password';
GRANT api_anon TO authenticator;

-- https://dba.stackexchange.com/questions/33943/granting-access-to-all-tables-for-a-user
GRANT ALL on SCHEMA bitcoin to api_anon;
GRANT ALL ON ALL TABLES IN SCHEMA bitcoin TO api_anon;

-- https://dba.stackexchange.com/questions/33943/granting-access-to-all-tables-for-a-user/33960#33960
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA bitcoin TO api_anon;