"use strict";

const configInstance = require("./kraken/platform/util/config")

const KrakenTransactionsFileWatcher = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsFileWatcher")
const KrakenTransactionsByAddressParser = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsByAddressParser")

const transactionsByAddressParser = new KrakenTransactionsByAddressParser({config: configInstance});
new KrakenTransactionsFileWatcher({ config: configInstance, transactionsParser: transactionsByAddressParser});

