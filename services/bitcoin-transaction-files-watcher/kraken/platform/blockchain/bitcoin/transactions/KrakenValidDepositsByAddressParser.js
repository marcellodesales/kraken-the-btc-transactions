const jq = require('node-jq')
const prettier = require("prettier");

module.exports = KrakenTransactionsByAddressParser;

function KrakenTransactionsByAddressParser({config}) {
    // the config to load
    this.config = config;

    // As documented at https://jqplay.org/s/Vwuqs7ZZCL
    // https://github.com/marcellodesales/kraken-the-btc-transactions/blob/master/docs/Requirements-Analysis.md#-sorted-received-transactions
    this.allValidDepositsJqFilter = `
[
  .transactions
  | map(select(.category == "receive"))
  | map(select(.confirmations >= 6))
  | map(select(.amount > 0))
  | sort_by(.time)
  | .[]
]
| group_by(.address)
| map({
    address: .[0].address,
    count: map(.txid) | length,
    txs: map({txid: .txid, amount: .amount}) 
  })
`
};

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenTransactionsByAddressParser.prototype.parse = function parse(transactionsDataFilePath) {
    return new Promise((resolve, reject)  => {
        const options = {}
        console.log(`Parsing transactions filePath '${transactionsDataFilePath}' with 
                 jq filter: ${this.allValidDepositsJqFilter}`);

        // Parse the json file with the jq filter https://github.com/sanack/node-jq#node-jq-equivalent
        jq.run(this.allValidDepositsJqFilter, transactionsDataFilePath, options).then((transactionsByAddressJson) => {
            console.log(`Transactions by wallet address: ${transactionsByAddressJson}`);
            const transactionsByAddressObject = JSON.parse(transactionsByAddressJson)
            resolve(transactionsByAddressObject);

        }).catch((errorWhileParsingTransactions) => {
            console.error(`ERROR: can't parse transaction files at ${transactionsDataFilePath}: ${errorWhileParsingTransactions}`);
            reject(errorWhileParsingTransactions)
        });
    });

};