"use strict";

// Load the config instance based on the environment
const configInstance = require("./kraken/platform/util/config")

// Load the classes
const KrakenTransactionsFileWatcher = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsFileWatcher")
const KrakenValidDepositsByAddressParser = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenValidDepositsByAddressParser")
const KrakenTransactionsDataServiceClient = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsDataServiceClient")

// Provide the file transactions watcher
new KrakenTransactionsFileWatcher({
    config: configInstance,
    transactionsParser: new KrakenValidDepositsByAddressParser({config: configInstance}),
    dataServiceClient:  new KrakenTransactionsDataServiceClient({config: configInstance})
});

