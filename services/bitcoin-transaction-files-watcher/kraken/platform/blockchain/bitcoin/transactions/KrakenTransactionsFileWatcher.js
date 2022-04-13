const fs = require("fs");
const os = require('os');
const {valid} = require("joi");

module.exports = KrakenTransactionsFileWatcher;

function KrakenTransactionsFileWatcher({config, transactionsParser, dataServiceClient}) {
    // the config to load
    this.config = config;

    // How to parse the transactions
    this.transactionsParser = transactionsParser;

    // The client that can save the transactions to the sink data store
    this.dataServiceClient = dataServiceClient;

    // The list of files processed
    this.filesPathsProcessed = [];

    // Resolve the ~ or relative dir during development
    this.config.dirToWatch = this.config.dirToWatch.startsWith("./") ?
        this.config.dirToWatch.replace("./", `${process.cwd()}/`) :
        resolveTilde(this.config.dirToWatch)

    console.log("Verifying if the directory " + this.config.dirToWatch + " exists");

    // verify that the dir to watch indeed exists before continuing...
    const stat = fs.statSync(this.config.dirToWatch);
    if (!stat.isDirectory()) {
        throw new Error(`The path '${this.config.dirToWatch}' is not a dir`);
    }

    // watch the dir as it exists...
    fs.statSync(this.config.dirToWatch);

    // persistent true as we need the process to be running in the background
    fs.watch(this.config.dirToWatch, { persistent: true }, this._onFileChange.bind(this));

    // Just save the healthcheck before it starts bootstrap the reading the files
    this._saveHealthcheckFile();

    //setup the initial status
    this._checkTransactionFile();
};

/**
 * Saves the healthcheck file for container healthcheck
 * @private
 */
KrakenTransactionsFileWatcher.prototype._saveHealthcheckFile = function _saveHealthcheckFile() {
    // Check before processing the transaction file
    if (!fs.existsSync(this.config.healthcheckFile)) {
        console.log(`Creating healtcheck file '${this.config.healthcheckFile}'`);
        // https://flaviocopes.com/how-to-create-empty-file-node/
        fs.closeSync(fs.openSync(this.config.healthcheckFile, 'w'))
        console.log(`Created healthcheck file at ${this.config.healthcheckFile}`)

    } else {
        console.log(`WARN: healthcheck file ${this.config.healthcheckFile} exists during bootstrap...`);
    }
};

/**
 * Verifies if the given filename exists and prints the status.
 */
KrakenTransactionsFileWatcher.prototype._checkTransactionFile = function _checkTransactionFile(fullFilePath) {
    // when triggered from an event of new file
    if (fullFilePath && fullFilePath.endsWith(this.config.transactionsFileExtension)) {
        var stat = fs.statSync(fullFilePath);
        if (!stat.isFile() || stat.size == 0) {
            console.log("ERROR: the path '" + fullFilePath + "' is not a file or has no content!");
            throw new Error(`The path '${fullFilePath}' is not a file with contents...`);
        }

        // process the transactions for the fullpath
        this.processTransaction(fullFilePath)
        return
    }

    // This is triggered when the server bootstraps
    // https://stackoverflow.com/questions/25460574/find-files-by-extension-html-under-a-folder-in-nodejs/42734993#42734993
    let dir = fs.readdirSync(this.config.dirToWatch);
    const extension = this.config.transactionsFileExtension
    let transactionFiles = dir.filter( function( elm ) {return elm.match(extension);});

    // For every file that exists during the bootstrap, process them
    transactionFiles.forEach(transactionFileName => {
        console.log(`Processing ${transactionFileName} at ${this.config.dirToWatch}`)
        const fullFilePath = `${this.config.dirToWatch}/${transactionFileName}`;
        try {
            this.processTransaction(fullFilePath);
            this.filesPathsProcessed.push(fullFilePath);

        } catch (errorProcessingTransactionFile) {
            console.error(`Couldn't process transaction file on bootstrap: ${errorProcessingTransactionFile}`)
        }
    });
};

/**
 * Event handler when the watched directory has changed. It returns the event of the change and the file name.
 *
 * @param {String} eventType is either "rename" or "change". The former is ignored as it is
 * fired twice when the file.
 * @param {String} filename is the name of the string, without the directory path.
 * is created.
 */
KrakenTransactionsFileWatcher.prototype._onFileChange = function onFileChange(eventType, filename) {
    console.log(`The following happened: ${eventType}`)

    // Skip if the event is during the creation (rename and change) and if the name is NOT needed.
    if (!filename.endsWith(this.config.transactionsFileExtension)) {
        return;
    }

    // The file may or may not exist depending on if it was created, removed, renamed, etc.
    const potentialFilePath = `${this.config.dirToWatch}/${filename}`;

    // Check before processing the transaction file
    if (fs.existsSync(potentialFilePath)) {
        console.log(`New event for file '${potentialFilePath}' at transactions dir... verifying...`);

    } else {
        console.error(`WARN: ${potentialFilePath} not found at fs... Moved, renamed, etc... skipping...`);
        return
    }

    // Check the configuration if the event was a rename or creation of the filename
    this._checkTransactionFile(potentialFilePath);
};

/**
 * Event handler when the watched directory has changed. It returns the event of the change and the file name.
 *
 * @param {String} eventType is either "rename" or "change". The former is ignored as it is
 * fired twice when the file.
 * @param {String} filename is the name of the string, without the directory path.
 */
KrakenTransactionsFileWatcher.prototype.processTransaction = function processTransaction(filePath) {
    console.log(`The transaction file=${filePath} will be parsed...`);

    this.transactionsParser.parse(filePath).then((parsedValidDepositsByWallets) => {
        // // Bulk upsert all the wallet addresses before saving the transactions
        this.dataServiceClient.saveWalletAddresses(parsedValidDepositsByWallets).then((bulkSaveResult) => {
            console.log(`Saved ${bulkSaveResult.data.length} wallet addresses from datafile '${filePath}'`);

            // // Now, bulk upsert all the transactions from all wallets
            this.dataServiceClient.saveWalletTransactions(parsedValidDepositsByWallets).then((bulkTransactionsResult) => {
                console.log(`Saved ${bulkTransactionsResult.data.length} wallet transactions from datafile '${filePath}'!`)

            }).catch((errorWhileSavingTransactions) => {
                console.error(`Couldn't save wallets transactions: ${errorWhileSavingTransactions}`)
            });

        }).catch((errorSavingWallets) => {
            console.error(`Error saving the wallets: ${errorSavingWallets}`)
        })

    }).catch((errorParsingTransactions) => {
        console.error(`Error parsing transaction files: ${errorParsingTransactions}`)
    })
};

/**
 * Resolves paths that start with a tilde to the user's home directory.
 *
 * @param  {string} filePath '~/GitHub/Repo/file.png'
 * @return {string}          '/home/bob/GitHub/Repo/file.png'
 */
function resolveTilde (filePath) {
    if (!filePath || typeof(filePath) !== 'string') {
        return '';
    }

    // '~/folder/path' or '~' not '~alias/folder/path'
    if (filePath.startsWith('~/') || filePath === '~') {
        return filePath.replace('~', os.homedir());
    }

    return filePath;
}