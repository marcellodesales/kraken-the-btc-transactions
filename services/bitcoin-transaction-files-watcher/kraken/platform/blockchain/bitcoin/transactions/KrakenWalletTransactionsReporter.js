/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

const { noExponents } = require('../../../util/number-util');

/**
 * Fetches the current aggregates view from the data storage and reports the summary as required.
 * The format is required because a regex will verify the results.
 *
 * Deposited for James T. Kirk: count=21 sum=1210.60058269
 * Deposited for Spock: count=16 sum=827.6408871
 * Deposited for Wesley Crusher: count=35 sum=183
 * Deposited for Montgomery Scott: count=27 sum=131.93252999999999
 * Deposited for Jonathan Archer: count=19 sum=97.48999999999998
 * Deposited for Leonard McCoy: count=18 sum=97
 * Deposited for Jadzia Dax: count=15 sum=71.83
 * Deposited without reference: count=23 sum=1151.8873822799999
 * Smallest valid deposit: 0.0000001
 * Largest valid deposit: 99.61064066
 *
 */
class KrakenWalletTransactionsReporter {

    /**
     * Builds a new instance of the reporter to print on the CLI.
     *
     * @param config is the full config of the app.
     * @param postgrestServiceClient is the connection to the data store service
     */
    constructor({config, postgrestServiceClient}) {
        console.log("🎤 WalletsTransactionsReporter Initializing KrakenWalletTransactionsReporter component...");

        // the config to load
        this.config = config;

        // Load the client for postgrest https://github.com/supabase/postgrest-js#quick-start
        this.transactionsDataServiceClient = postgrestServiceClient
    }

    /**
     * Full implementation that outputs the aggregate values in the screen.
     * TODO: could also be served as a service.
     */
    processWalletDepositsAggregations() {
        console.log("Fetch current wallet transactions aggregated values");

        const formatter = this._formatReport

        // Bulk Upsert and return the promise
        this.transactionsDataServiceClient
            .from("transactions_summary_by_wallet")
            .select()
            .then((currentWalletsDepositSummaries) => {
                console.log(`Current wallets: ${JSON.stringify(currentWalletsDepositSummaries.data)}`);
                console.log("#################### CURRENT WALLET TRANSACTIONS REPORT #######################");
                let transactionsSummary = formatter(currentWalletsDepositSummaries.data);

                // Print first the known users
                transactionsSummary.knownUsers.report.forEach((knownUserReport) => {
                    console.log(`${knownUserReport}`);
                });

                // Then, the unknown users
                transactionsSummary.unknownUsers.report.forEach((knownUserReport) => {
                    console.log(`${knownUserReport}`);
                });

                // Then, the min and max
                transactionsSummary.min.report.forEach((minValueReport) => {
                    console.log(`${minValueReport}`);
                })
                // Then, the unknown users
                transactionsSummary.max.report.forEach((maxValueReport) => {
                    console.log(`${maxValueReport}`);
                })
            })
    }

    /**
     * Formats the deposits summary to the one required by the specifications.
     * @param depositsSummary
     * @returns {{min: {instances: *[], report: *[]}, max: {instances: *[], report: *[]},
     * unknownUsers: {instances: *[], report: *[]}, knownUsers: {instances: *[], report: *[]}}}
     * @private
     * TODO: Serve this via HTTP
     */
    _formatReport(depositsSummary) {
        let transactionsSummary = {
            knownUsers: {
                instances: [],
                report: []
            },
            unknownUsers: {
                instances: [],
                report: []
            },
            min: {
                instances: [],
                report: []
            },
            max: {
                instances: [],
                report: []
            }
        }
        depositsSummary.forEach((walletDepositsSummary) => {
            if (walletDepositsSummary["user_id"] > 0) {
                transactionsSummary.knownUsers.instances.push(walletDepositsSummary);
                let lastName = walletDepositsSummary["last_name"] ? ` ${walletDepositsSummary["last_name"]}` : "";
                let userFullName = `${walletDepositsSummary["first_name"]}${lastName}`;
                transactionsSummary.knownUsers.report.push(`Deposited for ${userFullName}: count=${walletDepositsSummary["count"]} sum=${walletDepositsSummary["total"]}`);

            } else {
                transactionsSummary.unknownUsers.instances.push(walletDepositsSummary);
            }

            // Figure out the min/max
            transactionsSummary.min.instances.push(parseFloat(walletDepositsSummary["min"]));
            transactionsSummary.max.instances.push(parseFloat(walletDepositsSummary["max"]));
        });

        // https://stackoverflow.com/questions/5732043/how-to-call-reduce-on-an-array-of-objects-to-sum-their-properties/69929291#69929291
        // compute the summary for the unknown users
        const unknownUsersSummary = transactionsSummary.unknownUsers.instances.reduce((previous, current) => {
            return {
                count: parseFloat(previous["count"]) + parseFloat(current["count"]),
                total: parseFloat(previous["total"]) + parseFloat(current["total"])
            };
        }, {
            count: 0,
            total: 0
        });
        transactionsSummary.unknownUsers.report.push(`Deposited without reference: count=${unknownUsersSummary.count} sum=${unknownUsersSummary.total}`);

        // Resolve the min/max from the report
        let smallestTransactionValue = transactionsSummary.min.instances.reduce((prev, curr) => {
            return Math.min(prev, curr)
        });
        smallestTransactionValue = noExponents(smallestTransactionValue);
        transactionsSummary.min.report.push(`Smallest valid deposit: ${smallestTransactionValue}`);

        let largestTransactionValue = transactionsSummary.max.instances.reduce((prev, curr) => {
            return Math.max(prev, curr)
        });
        largestTransactionValue = noExponents(largestTransactionValue);
        transactionsSummary.max.report.push(`Largest valid deposit: ${largestTransactionValue}`);

        return transactionsSummary;
    }
}

module.exports = KrakenWalletTransactionsReporter;
