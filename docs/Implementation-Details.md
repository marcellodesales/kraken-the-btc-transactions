The system is now implemented and here is the current design of this solution:

# Data Collection Analysis

* [x] The `Transactions Database` is assumed to be running indirectly through the `Transactions Data Service`.
  * It serves the durable data storage of the transactions for analysis.
* [x] The `Transactions Data Service` provides a REST Interface to a `Postgrest Servcer`. 
  * The current design of the watcher requires the URL of this service and it's userd by the `KrakenTransactionsDataServiceClient`.
* [x] The `KrakenTransactionsDataServiceClient` makes bulk updates to the `Transactions Database` through the `Data Service client`.
  * Before, it receives the parsed transactions from the `KrakenValidDepositsByAddressParser`.
* [x] The `KrakenValidDepositsByAddressParser` implements the filtering solution of the valid transactions.
  * Discussed in the requirements, this component is used for any other custom filtering of the valid transactions.
  * It makes sure data is unique before storing on the database after receiving them from the `KrakenTransactionsFileWatcher`.
* [x] The `KrakenTransactionsFileWatcher` provides the list of the transaction data files to the system.
  * Once bootstrapped, the component will first scan the directory and initial the process.
  * While the process is running, it monitors the file system for events of new files, deleted files, which are properly
  filtered and verified before sent to the upstream component.

> Not a perfect representation, but gives an idea of the watcher system.

```
                          ┌───────────────────────────┐            ┌──────────────────────────────┐
                          ├───────────────────────────┤            │                              │
                          │ Transactions     POSTGRES │            │                              │
                          │  Database           ┌─────┤            │                              │
                          │                     │ 5432│◄───────────┤  Transactions Data Service   │
                          │ - users             └─────┤            │                              │
                          │ - wallets                 │            │      postgREST Server ┌──────┤
                          │ - wallets_x_users         │            │                       │ 4565 │
                          │ - wallet_transactions     │            └───────────────────────┴─▲────┘
                          │ - transactions_aggregates │                                      │
                          └───────────────────────────┘               CRUD         ┌─────────┘
                                                                                   │
                ┌─────────────────────────┬────────────────────────────────────────┼───────────────┐
                │ Transactions Data File  │                                        │               │
                │    Watcher Container    │                                        │               │
                ├─────────────────────────┘   ┌────────────────────────────────────┼───┐           │
                │                             ├────────────────────────────────────────┤           │
Env vars Config │                             │                                        ├─────────┐ │
  Injected      │                             │  KrakenTransactionsDataServiceClient   │         │ │
                │                             │                                        │         │ │
   │   │   │    │                             └────────────────────────────────────────┘         │ │
   │   │   │    │                                                                                │ │
   └───┴───┴────┼─────┬────┬────┐             ┌───────────────────────────────────────┐          │ │
                │     │    │    │             ├───────────────────────────────────────┤          │ │
                │   ┌─▼────▼────▼┐            │                                       │          │ │
                │   │ config     │            │   KrakenValidDepositsByAddressParser  ├───────┐  │ │
                │   │            │            │                                       │       │  │ │
                │   └──────┬─────┘            └───────────────────────────────────────┘       │  │ │
                │          │                                                                  │  │ │
                │          │                    ┌────────────────────────────────────┐        │  │ │
                │   ┌──────┴──────┐             ├────────────────────────────────────┤        │  │ │
                │   │             │             │                                    │        │  │ │
                │   │ service.js  ◄─────────────┤   KrakenTransactionsFileWatcher    ◄────────┘  │ │
                │   │             │             │                                    │           │ │
                │   └──────┬──────┘             │                                    ◄───────────┘ │
                │          │                    └───────────────────┬────────────────┘             │
                │          │                                        │                              │
                │          │                                        │                              │
                │          │                                        │                              │
                │          │                                        │                              │
                │          │                                        │                              │
                │     ┌────▼────────────────────┬───────────────────▼──────────────────────┐       │
                │     │                         │                                          │       │
                │     │   Healthcheck file      │        Transactions Data volume (files)  │       │
                └─────┴─────────────────────────┴──────────────────────────────────────────┴───────┘
```

# Data Processing

> WIP: these need to be implemented next.

* [ ] Each time a new file is processed, we have to calibrate the statistical model of the values to compute the final values.
* [ ] CLI-based reporter must output the desired values into the logs