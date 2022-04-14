
module.exports = KrakenWalletTransactionsRepoter;

/**
 * Fetches the current transactions and produces aggregated values based on the list of wallets.
 *
 * @param config
 * @constructor
 */
function KrakenWalletTransactionsRepoter({config, postgrestServiceClient}) {
    console.log("🎤 WalletsTransactionsReporter Initializing KrakenWalletTransactionsRepoter component...");

    // the config to load
    this.config = config;

    // Load the client for postgrest https://github.com/supabase/postgrest-js#quick-start
    this.transactionsDataServiceClient = postgrestServiceClient
}

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenWalletTransactionsRepoter.prototype.processWalletDepositsAggregations = function processWalletDepositsAggregations() {
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
};

KrakenWalletTransactionsRepoter.prototype._formatReport = function formatReport(depositsSummary) {
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
    }).noExponents();
    transactionsSummary.min.report.push(`Smallest valid deposit: ${smallestTransactionValue}`);

    let largestTransactionValue = transactionsSummary.max.instances.reduce((prev, curr) => {
        return Math.max(prev, curr)
    }).noExponents();
    transactionsSummary.max.report.push(`Largest valid deposit: ${largestTransactionValue}`);

    return transactionsSummary;
};

// https://stackoverflow.com/questions/18719775/parsing-and-converting-exponential-values-to-decimal-in-javascript/18719988#18719988
Number.prototype.noExponents = function() {
    var data = String(this).split(/[eE]/);
    if (data.length == 1) return data[0];

    var z = '',
        sign = this < 0 ? '-' : '',
        str = data[0].replace('.', ''),
        mag = Number(data[1]) + 1;

    if (mag < 0) {
        z = sign + '0.';
        while (mag++) z += '0';
        return z + str.replace(/^\-/, '');
    }
    mag -= str.length;
    while (mag--) z += '0';
    return str + z;
}