CREATE SCHEMA bitcoin;

CREATE TYPE bitcoin.user_origin AS ENUM (
  'file',
  'ws'
);

CREATE TYPE bitcoin.transaction_category AS ENUM (
  'send',
  'receive'
);

CREATE TABLE bitcoin.users (
  "user_id" SERIAL PRIMARY KEY,
  "first_name" varchar NOT NULL,
  "last_name" varchar NULL,
  -- https://www.postgresqltutorial.com/postgresql-date-functions/postgresql-current_timestamp/
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "origin" bitcoin.user_origin DEFAULT 'file',
  UNIQUE("first_name", "last_name")
);

CREATE TABLE bitcoin.wallets (
  "wallet_address" varchar PRIMARY KEY,
  -- https://www.postgresqltutorial.com/postgresql-date-functions/postgresql-current_timestamp/
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- https://stackoverflow.com/questions/9789736/how-to-implement-a-many-to-many-relationship-in-postgresql/9790225#9790225
CREATE TABLE bitcoin.wallets_x_users (
  "wallet_address" varchar REFERENCES bitcoin.wallets ("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" SERIAL REFERENCES bitcoin.users ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "bitcoin.wallets_x_users_pkey" PRIMARY KEY ("wallet_address", "user_id")
);

CREATE TABLE bitcoin.wallet_transactions (
  "txid" varchar,
  "wallet_address" varchar,
  "amount" float NOT NULL,
  "category" bitcoin.transaction_category DEFAULT 'receive',
  PRIMARY KEY ("txid", "wallet_address"),
  FOREIGN KEY ("wallet_address") REFERENCES bitcoin.wallets ("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE
);

-- The view of the users and wallets already sorted by the total values. For min, max, just search on the columns
-- https://stackoverflow.com/questions/406294/left-join-vs-left-outer-join-in-sql-server/406333#406333
CREATE OR REPLACE VIEW bitcoin.transactions_summary_by_wallet AS
SELECT
    wxu.user_id,
    u.first_name,
    u.last_name,
    wt.wallet_address,
    category,
    COUNT(amount) as count,
    SUM(amount) as total,
    MAX(amount) as max,
    MIN(amount) as min
FROM
    bitcoin.wallet_transactions wt
    LEFT JOIN
    bitcoin.wallets_x_users wxu ON wt.wallet_address = wxu.wallet_address
    LEFT JOIN
    bitcoin.users u ON wxu.user_id = u.user_id
GROUP BY (wt.wallet_address, wt.category, wxu.user_id, u.first_name, u.last_name)
ORDER BY total DESC;

CREATE INDEX "bitcoin.user_unique_full_name_idx" ON bitcoin.users ("first_name", "last_name");

CREATE INDEX "bitcoin.origin_idx" ON bitcoin.users ("origin");

CREATE INDEX "bitcoin.transactions_category_idx" ON bitcoin.wallet_transactions ("category");