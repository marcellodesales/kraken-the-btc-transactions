const jq = require('node-jq')

module.exports = KrakenValidDepositsByAddressParser;

/**
 * Converts a full transaction object to a consolidated view, as the problem only requires
 * parts of the data for the moment.
 *
 *   {
    "involvesWatchonly": true,
    "account": "",
    "address": "mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n",
    "category": "receive",
    "amount": 8.56,
    "label": "",
    "confirmations": 55,
    "blockhash": "efbe824e87efde591d29671c468d2216d54caa9f601002270f55577eb941fb0c",
    "blockindex": 70,
    "blocktime": 1627625548873,
    "txid": "7b9cfbed67d423e51ec31b4887764710a496d8c6b7f5d32d9fe6387af3471915",
    "vout": 77,
    "walletconflicts": [],
    "time": 1627625504595,
    "timereceived": 1627625504595,
    "bip125-replaceable": "no"
  },
 *
 * The result of the parsed transaction is just a deposit transaction
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
function KrakenValidDepositsByAddressParser({config}) {
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
KrakenValidDepositsByAddressParser.prototype.parse = function parse(transactionsDataFilePath) {
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