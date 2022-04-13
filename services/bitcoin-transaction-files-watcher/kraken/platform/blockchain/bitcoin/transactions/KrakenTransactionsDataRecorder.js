
const PostgrestClient = require('@supabase/postgrest-js').PostgrestClient

module.exports = KrakenTransactionsDataRecorder;

/**
 * Parses a parsed deposit transaction
 *  {
 *   "address": "myuPFnmpChJurtvdKCVVK5S4ZU9JcgSmoj",
 *   "count": 1,
 *   "txs": [
 *     {
 *       "txid": "2e249dbe4706cca44324c294f8842627b42bb8fab30539288b0ee94b76340cd4",
 *       "amount": 28.62734149
 *     }
 *   ]
 * },
 *
 * @param config
 * @constructor
 */
function KrakenTransactionsDataRecorder({config}) {
    console.log("📹 TransactionsDataRecorder Initializing KrakenTransactionsDataRecorder component...");

    // the config to load
    this.config = config;

    // Load the client for postgrest https://github.com/supabase/postgrest-js#quick-start
    this.transactionsDataServiceClient = new PostgrestClient(this.config.transactionsDataServiceHost);
    this.transactionsDataServiceClient.shouldThrowOnError = true;
}

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenTransactionsDataRecorder.prototype.saveWalletAddresses = function saveWalletAddresses(walletsDepositsList) {
    console.log("Upsert bulk collection of wallet addresses for faster operation");

    // convert from the wallets address to a collection of wallet records
    // https://supabase.com/docs/reference/javascript/insert#bulk-create
    var walletAddressesList = walletsDepositsList.map((walletTransactions) => {
        return { wallet_address: walletTransactions['address'] }
    });

    // Bulk Upsert and return the promise
    return this.transactionsDataServiceClient
        .from("wallets")
        .upsert(walletAddressesList)
};

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenTransactionsDataRecorder.prototype.saveWalletTransactions = function saveWalletTransactions(walletsDepositsList) {
    console.log("Upsert bulk collection of transactions by wallets");

    let all_transactions = [];
    walletsDepositsList.forEach((walletTransactions) => {
        // convert from the wallets address to a collection of wallet records
        // https://supabase.com/docs/reference/javascript/insert#bulk-create
        const transactionsList = walletTransactions["txs"];

        // flatten the array being pushed because some may have many transactions, others only one
        // https://stackoverflow.com/questions/4007744/how-to-do-a-flat-push-in-javascript/60163179#60163179
        all_transactions.push(...transactionsList.map((singleWalletTransaction) => {
            return { wallet_address: walletTransactions["address"], txid: singleWalletTransaction["txid"],
                amount: singleWalletTransaction["amount"] }
        }));
    });

    // Bulk Upsert and return the promise
    return this.transactionsDataServiceClient
        .from("wallet_transactions")
        .upsert(all_transactions)
};
