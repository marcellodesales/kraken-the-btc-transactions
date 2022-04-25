Based on the Functional and Non-functional [[Requirements-Analysis]], I'd like to propose the following design of runtime components that are deployed in a containerized way, as described in our [[techstack]]

```
             
            ┌──────────┐                         ┌──────────┐
            │ 🔭 🔄 📹 │ Parse, Filter Valid     │┼┼┼┼┼┼┼┼┼┼│
   ┌────────┴────┐     │Deposits             ┌───┴───────┼┼┼│
   │Bitcoin      ◄─────┘                     │ 👽 Data   │┼┼│
   │Transactions │                           │ Service   ├──┘
   │Processor    ├───────────────────────────►  REST     │
   └──────────▲──┘  HTTP POST /users         │           │
      NewFile │     HTTP POST /wallets       │(PostgREST)│
       Event  │     HTTP POST /transactions  └───▲─────┬─┘
              │                                  │     │ INSERT INTO users
     ┌────────┴─┐                                │     │ INSERT INTO transactions
     │  Volume  │         ┌──────────────────────┘     │ INSERT INTO wallets
     └──────────┘         │HTTP GET /tr_summary        │ SELECT * FROM tr_summary
    !/data/transactions   │                            │
    !/data/users          │                            │
                          │                ┌───────────▼──────┐
                          │                ├──────────────────┤
   ┌─────────────────┐    │                │  🔋 Database     │
   │  🎤 Reporter    ├────┘                │    (Postgres)    │
   │                 │                     │ 🗂️ 🗂️ 🗂️ 🗂️ 💰  │
   └─────────────────┘                     └──────────────────┘
```

# 🔭 DataFilesWatcher

> Watches a given volume for data files (transactions, users) to be processed
  
* For each new file added to the data transactions dir, a `NewFileEvent` is published along with type (user, transactions)
* `!/data/users`: The list of known users provided
  * Implements [Usecase](https://github.com/marcellodesales/kraken-the-btc-transactions/wiki/Functional-Requirements#the-system-should-be-able-to-manage-users-so-that-users-can-be-identified)
* `!/data/transactions`: The list of transactions to be processed

# 🔄 DataFileLoader

> Loads and Processes a given transaction `filepath` in the volume

* It's async and subscribes to the message topics of `NewFileEvent` that has a type
* For `user data files`, it create users and the associated wallets through the API Gateway

# 📹 TransactionsDataRecorder

> Saves the collected data by the DataFileLoader and stores it to the Database through an CRUD HTTP client

* For the data collected by, it submits all the transactions through the client API.
* It handles bulk updates of the data as it is first filtered and organized properly for faster operations.
  * It calls the CRUD operations to the `TransactionsDataService`

# 👽 TransactionsDataService

> Exposes APIs to update the database using CRUD operators.
> Implemented using [postgREST](https://github.com/mattddowney/compose-postgrest#architecture)
> * **NOTE**: (v1) of this solution won't include the endpoints

* `/users`: manages the users and their associated wallets
* `/users/X/wallets`: manages the given `X` wallets
* It's the only way to directly interface with the Database (Postgres)
  * ~Other than Kafka connector for CDC (v2)~

# 💰 WalletTransactionsAggregator

> Processes a given wallet's transactions into aggregated [values of total amount deposited, min, max values](https://github.com/marcellodesales/kraken-the-btc-transactions/wiki/Requirements-Analysis#-logs)

* ~~It makes sure to generate the proper values to re-compute the current values for faster retrieval.~~
* ~~Subscribed to `AggregateTransactionsEvent` CDC by Kafka + PostgreSQL (v2)~~
* ~~Updates the current known state by a wallet~~
    * ~~Delete all current values of aggregates~~
    * ~~Updates all the current values~~
* ~~The values are used by the CLI Reporter that shows the values required.~~

* Decided with the implementation of a View in the Database Layer
  * Results are produced in the data source instead of automating data processing
  * We can compute the final report properly when retrieving the data. 
  * Produces the same result of https://jqplay.org/s/weXDSQzPAo

> **REF**: https://stackoverflow.com/questions/406294/left-join-vs-left-outer-join-in-sql-server/406333#406333
  
# 🎤 WalletsTransactionsReporter

> Produces the required view of the state as log statements

* Implements the [outputs required](https://github.com/marcellodesales/kraken-the-btc-transactions/wiki/Requirements-Analysis#-existing-users-transactions)
  * Show the list of aggregated counts known users' wallets
  * Show the aggregated count of unknown users' wallets
  * Show the aggregated min/max values

# 📆 Kafka Live Events

> Pub/sub stream service to store system events and trigger CDC database events

* Publishes events based on the data files to be processed
* Publishes Change Data Capture (CDC) from updates to Wallets in Postgres

# 🔋 Postgres Database

> Normalized Relational Model for users and wallets data https://dbdiagram.io/d/6253faaf2514c9790309f3e1

![Screen Shot 2022-04-11 at 4 53 18 AM](https://user-images.githubusercontent.com/131457/162734088-35171dba-e8c2-4227-b211-69bb271ff814.png)

* `user_origin` ENUM: identifies if the user was added by file or api
* `transaction_category` ENUM: identifies transactions as `send` or `receive` 

![Screen Shot 2022-04-11 at 4 22 12 AM](https://user-images.githubusercontent.com/131457/162729751-41547d15-4785-48a0-93d2-fcef90c0df01.png)
![Screen Shot 2022-04-11 at 4 54 13 AM](https://user-images.githubusercontent.com/131457/162734189-21661df1-507f-483a-b446-f85078401e21.png)

## 🗂️ Table Users

* Records of users, when created, origin (`file`, `ws`)

## 🗂️ Table Wallets

* Records of wallet address and when created

## 🗂️ Table Wallets_X_Users (m-n)

* Records of the user's wallets

## 🗂️ Table Wallet_Transactions

* Records of the withdraw or deposit transactions for wallets for given category (`send`, `receive`)
  * Category defaults to `receive` as we are initially supporting `deposits`, but it's open to process withdraws

## 🗂️ Table Transaction_aggregate

* Records the current aggregates by wallets, processed by async events
  * Initially designed to be updated by CDC
  * Should we consider stored procedures?
  * Used for the CLI reporting

# V2 Ultra-scale decoupled solution - Event-driven Data Pipeline

* If we use an async version of the solution, we can scale based on the compute provided.
* Just declouding the parts with an Event-driven Pipeline with Kafka + CDC

```
┌─────────┐                 ┌──────────┐                  ┌───────────┐
│ 🔭Data  │  NewFileEvent   │          ├──────────────────►├┼┼┼┼┼┼┼┼┼┼│
│ Files   ├─────────────────► 📆 Kafka │   LoadFileEvent  │┼┼┼┼┼┼┼┼┼┼┼│
│Watcher  │                 │   live   │              ┌───┴────────┼┼┼│
│      (1)│   ┌──────────┐  │  Events  ├──────────────►  🔄 Data   │┼┼│
└─────────┴───►  Volume  │  └─┬──────▲─┘ LoadFileEvent│   File     │┼┼│
              └──────────┘    │      │                │  Loader    │┼┼│
 !/data/transactions          │      │                │      [1,x] ├─┼┘
 !/data/users                 │      │ CDC            └───────────┬┘ │
                              │  ┌───┼──────────────┐             │  │
  ┌───────────┐ Aggregate     │  ├──────────────────┤             │  │
  │┼┼┼┼┼┼┼┼┼┼┼│Transactions   │  │  🔋 Database     │             │  │
┌─┴────────┼┼┼│ Event (wallet)│  │    (Postgres)    │             │  │
│ 💰Wallet │┼┤◄───────────────┘  │                  │             │  │
│ Transact │┼┼│                  └──▲───▲───────────┘             │  │
│Aggregator│┼┼│                     │   │                         │  │
│          │┼┤◄───┐                 │   │  CRUD                   │  │
│     [1,x]├──┘   │Aggregate        │   │                         │  │
└───┬────┬─┘      │WalletTransacs   │ ┌─┼─────────┐               │  │
    │    └────────┘                 │ │┼┼┼┼┼┼┼┼┼┼┼│               │  │
    │                            ┌──┴─┴─────┼┼┼┼┼┼│               │  │
    │                            │ 👽 API   │┼┼┼┼┼│               │  │
    │GET /wallets/X/transactions │  Gateway │┼┼┼┼┤◄───────────────┘  │
    └────────────────────────────►          ├─────┘   POST /users    │
    POST /wallets/X/aggregates   │          │ POST /users/X/wallets  │
  DELETE /wallets/X/aggregates   │     [1,x]◄────────────────────────┘
                                 └─▲────────┘
                                   │
┌─────────────────┐                │ GET /wallets/reports?type=tp*
│ 📊 CLI Reporter │                │ tp*=known | unknown | max  | min
│ *(entrypoint)(1)├────────────────┘
└─────────────────┘
```

## Bootstrap

* Watches a `given volume directory path` where to locate transactions data.
  * Filtered by `.json` extension
  * Directory `users` for new users
  * Directory `transactions` for new transactions
* Triggers events as described above to process the inputs

## Entrypoint Logs

* It should start and show current reports after loading
* It should show the reports after processing all the current files under the input