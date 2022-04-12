"use strict";

const configInstance = require("./kraken/platform/util/config")
const KrakenTransactionsFileWatcher = require("./kraken/platform/blockchain/bitcoin/transactions/KrakenTransactionsFileWatcher")

new KrakenTransactionsFileWatcher({ config: configInstance });

