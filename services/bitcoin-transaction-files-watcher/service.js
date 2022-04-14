/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

/*

* The Transactions Database is assumed to be running indirectly through the Transactions Data Service
* The Transactions Data Service provides a REST Interface to a Postgrest Servcer. The current design of the
  watcher requires the URL of this service and it's userd by the KrakenTransactionsDataRecorder.
* The KrakenTransactionsDataRecorder makes bulk updates to the Transactions Database through the data service client,
  after it has received the parsed transactions from the KrakenValidDepositsByAddressParser.
* The KrakenValidDepositsByAddressParser implements the filtering solution discussed in the requirements and can be
  used for any other custom filtering of the data, sorting, and making sure the data is unique before storing on the database.
  It receives the data from the KrakenTransactionsFileWatcher, which is watching the filesystem for data.
* The KrakenTransactionsFileWatcher proxies live notifications of data stored in the volume and lists all the transaction
  files from the provided data location.

                                                              ┌──────────────────────────────┐
                     ┌───────────────────────────┐            │||||||||||||||||||||||||||||||│
                     │|||||||||||||||||||||||||||│            ├──────────────────────────────┤
                     ├───────────────────────────┤            │                              │
                     │ Transactions     POSTGRES │            │  Transactions Data Service   │
                     │  Database           ┌─────┤            │                              │
                     │                     │ 5432│◄───────────┤       postgREST Server       │
                     │ - users             └─────┤            │                              │
                     │ - wallets                 │            │                       ┌──────┤
                     │ - wallets_x_users         │            │                       │ 4565 │
                     │ - wallet_transactions     │            └───────────────────────┴─▲──▲─┘
                     │ - transactions_by_wallet  │                                      │  │
                     └───────────────────────────┘                                 CRUD │  │
                                                      ┌─────────────────────────────────┘  │
                                                      │                                    │
                  ┌───────────────────────────────────┴────────────────────────────────────┴───────────┐
                  │ TransactionsProcessor||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||│
                  ├───────────────────────────────────┬────────────────────────────────────┬───────────┤
                  │                                   │                                    │           │
                  │  ┌────────────────────────────────┼─┐   ┌──────────────────────────────┼─┐         │
                  │  ├──────────────────────────────────┤   ├────────────────────────────────┤         │
                  │  │                                  │   │                                │         │
                  │  │ KrakenWalletTransactionsReporter │   │ KrakenTransactionsDataRecorder │         │
                  │  │                                  │   │                                ├───────┐ │
Env vars Config   │  └──────────────────────────────────┘   └────────────────────────────────┘       │ │
  Injected        │                                                                                  │ │
                  │                                 ┌────────────────────────────────────┐           │ │
   │   │   │      │                                 ├────────────────────────────────────┤           │ │
   │   │   │      │                                 │                                    │           │ │
   └───┴───┴──────┼─────────────┬────┬────┐         │ KrakenValidDepositsByAddressParser ├────────┐  │ │
                  │             │    │    │         │                                    │        │  │ │
                  │           ┌─▼────▼────▼┐        └────────────────────────────────────┘        │  │ │
                  │           │ config     │                                                      │  │ │
                  │           │            │          ┌───────────────────────────────┐           │  │ │
                  │           └──────┬─────┘          ├───────────────────────────────┤           │  │ │
                  │                  │                │                               │           │  │ │
                  │           ┌──────┴──────┐         │ KrakenTransactionsFileWatcher ◄───────────┘  │ │
                  │           │             ◄─────────┤                               │              │ │
                  │           │ service.js  │         │                               ◄──────────────┘ │
                  │           │             │         └─────────────────┬─────────────┘                │
                  │           └──────┬──────┘                           │                              │
                  │                  │                                  │                              │
                  │                  │                                  │                              │
                  │                  │                                  │                              │
                  │                  │                                  │                              │
                  │       ┌──────────▼──────────────┬───────────────────▼──────────────────────┐       │
                  │       │                         │                                          │       │
                  │       │   Healthcheck file      │        Transactions Data volume (files)  │       │
                  └───────┴─────────────────────────┴──────────────────────────────────────────┴───────┘
 */

const PostgrestClient = require('@supabase/postgrest-js').PostgrestClient

// Load the config instance based on the environment
const configInstance = require("./kraken/platform/util/config")

// Make the instance to talk to the postgrest REST service, setup for errors
const postgrestClient = new PostgrestClient(configInstance.transactionsDataServiceHost);
postgrestClient.shouldThrowOnError = true;

// Load the classes
const KrakenTransactionsFileWatcher = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsFileWatcher")
const KrakenValidDepositsByAddressParser = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenValidDepositsByAddressParser")
const KrakenTransactionsDataRecorder = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsDataRecorder")
const KrakenWalletTransactionsReporter = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenWalletTransactionsReporter")

// Provide the file transactions watcher, will keep the process bound to the fs events.
new KrakenTransactionsFileWatcher({
    config: configInstance,
    transactionsParser: new KrakenValidDepositsByAddressParser({config: configInstance}),
    transactionsDataRecorder:  new KrakenTransactionsDataRecorder({config: configInstance,
        postgrestServiceClient: postgrestClient}),
    walletTransactionsReporter:  new KrakenWalletTransactionsReporter({config: configInstance,
        postgrestServiceClient: postgrestClient})
});
