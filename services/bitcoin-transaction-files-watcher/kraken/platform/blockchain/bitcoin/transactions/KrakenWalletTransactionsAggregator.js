
module.exports = KrakenWalletTransactionsAggregator;

/**
 * Fetches the current transactions and produces aggregated values based on the list of wallets.
 *
 * @param config
 * @constructor
 */
function KrakenWalletTransactionsAggregator({config, postgrestServiceClient}) {
    console.log("💰 WalletTransactionsAggregator Initializing KrakenTransactionsDataRecorder component...");

    // the config to load
    this.config = config;

    // Load the client for postgrest https://github.com/supabase/postgrest-js#quick-start
    this.transactionsDataServiceClient = postgrestServiceClient
}

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenWalletTransactionsAggregator.prototype.fetchCurrentWallets = function fetchCurrentWallets() {
    console.log("Fetch current wallets registered by the service");
};


/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenWalletTransactionsAggregator.prototype.aggregateWalletTransactions = function aggregateWalletTransactions(walletAddress) {
    console.log(`Aggregating the transactions of wallet address=${walletAddress} for reporting`);
};