/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

/**
 *
 * Persists the transaction in the database through the data service client.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */
class KrakenTransactionsDataRecorder {

    /**
     * The config and the instance of the data service.
     * @param config the configuration
     * @param postgrestServiceClient the service client
     */
    constructor({config, postgrestServiceClient}) {
        console.log("📹 TransactionsDataRecorder Initializing KrakenTransactionsDataRecorder component...");

        // the config to load
        this.config = config;

        // Load the client for postgrest https://github.com/supabase/postgrest-js#quick-start
        this.transactionsDataServiceClient = postgrestServiceClient;
    }

    /**
     * Saves the wallet addresses into the data storage.
     */
    saveWalletAddresses(walletsDepositsList) {
        console.log("Upsert bulk collection of wallet addresses for faster operation");

        // convert from the wallets address to a collection of wallet records
        // https://supabase.com/docs/reference/javascript/insert#bulk-create
        let walletAddressesList = walletsDepositsList.map((walletTransactions) => {
            return { wallet_address: walletTransactions['address'] }
        });

        // Bulk Upsert and return the promise
        return this.transactionsDataServiceClient
            .from("wallets")
            .upsert(walletAddressesList)
    };

    /**
     * Saves the wallet transactions in the database.
     */
    async saveWalletTransactions(walletsDepositsList) {
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
        return await this.transactionsDataServiceClient
            .from("wallet_transactions")
            .upsert(all_transactions)
    };
}

module.exports = KrakenTransactionsDataRecorder;