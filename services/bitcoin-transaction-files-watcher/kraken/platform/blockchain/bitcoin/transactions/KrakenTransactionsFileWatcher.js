/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

const fs = require("fs");
const { resolveTilde } = require('../../../util/string-utils');

/**
 * Creates an orchestrator that watches the file-system for the following sequence:
 * 1. bootstrap: when the process starts
 * 2. file-system events: when new files are added or removed.
 *
 * 1. Bootstraps and loads all transaction files under the watch dir
 * 2. Parses each file for the transactions, filtering for the desired type
 * 3. Persists the state by wallet, users, transactions, etc.
 * 4. Generates a report based on the summary view of the data.
 */
class KrakenTransactionsFileWatcher {

    /**
     * Creates a new file watcher process-based instance tat will be watching the dirs.
     *
     * @param config the full config used also by the environment.
     * @param transactionsParser parses and filters the valid transactions for the data recorder.
     * @param transactionsDataRecorder stores the valid transactions in the database.
     * @param walletTransactionsReporter
     */
    constructor({config, transactionsParser, transactionsDataRecorder, walletTransactionsReporter}) {
        console.log("🔭 DataFilesWatcher Initializing KrakenTransactionsFileWatcher component...");

        // the config to load
        this.config = config;

        // How to parse the transactions
        this.transactionsParser = transactionsParser;

        // The client that can save the transactions to the sink data store
        this.transactionsDataRecorder = transactionsDataRecorder;

        this.walletTransactionsAggregator = walletTransactionsReporter;

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
        // https://javascript.info/bind
        fs.watch(this.config.dirToWatch, {persistent: true}, this.onFileChange.bind(this));

        // Just save the healthcheck before it starts bootstrap the reading the files
        this._saveHealthcheckFile();

        // Bootstap the watch dir as it might contain files
        this._bootstrapCurrentWatchDir();
    }

    /**
     * Saves the healthcheck file for container healthcheck
     * @private
     */
    _saveHealthcheckFile() {
        // Check before processing the transaction file
        if (!fs.existsSync(this.config.healthcheckFile)) {
            console.log(`Creating healtcheck file '${this.config.healthcheckFile}'`);
            // https://flaviocopes.com/how-to-create-empty-file-node/
            fs.closeSync(fs.openSync(this.config.healthcheckFile, 'w'))
            console.log(`Created healthcheck file at ${this.config.healthcheckFile}`)

        } else {
            console.log(`WARN: healthcheck file ${this.config.healthcheckFile} exists during bootstrap...`);
        }
    }

    /**
     * Verifies if the given filename exists and prints the status.
     * @private
     */
    async _checkTransactionFile(fullFilePath) {
        // when triggered from an event of new file
        if (fullFilePath && fullFilePath.endsWith(this.config.transactionsFileExtension)) {
            let stat = fs.statSync(fullFilePath);
            if (!stat.isFile() || stat.size == 0) {
                console.log("ERROR: the path '" + fullFilePath + "' is not a file or has no content!");
                throw new Error(`The path '${fullFilePath}' is not a file with contents...`);
            }

            // process the transactions for the fullpath
            let bootstrapping = false;
            return await this.processTransaction(fullFilePath, bootstrapping)
        }
    }

    /**
     * Only executed during the bootstrap to load the current files and process them.
     * @returns {Promise<void>}
     * @private
     */
    async _bootstrapCurrentWatchDir() {
        // This is triggered when the server bootstraps
        // https://stackoverflow.com/questions/25460574/find-files-by-extension-html-under-a-folder-in-nodejs/42734993#42734993
        let dir = fs.readdirSync(this.config.dirToWatch);
        const extension = this.config.transactionsFileExtension
        let transactionFiles = dir.filter(function (elm) {
            return elm.match(extension);
        });

        // For every file that exists during the bootstrap, process them
        try {
            for (const transactionFileName of transactionFiles) {
                console.log(`Processing ${transactionFileName} at ${this.config.dirToWatch}`)
                const fullFilePath = `${this.config.dirToWatch}/${transactionFileName}`;

                let bootstrapping = true;
                const result = await this.processTransaction(fullFilePath, bootstrapping);
                this.filesPathsProcessed.push(fullFilePath);
            }

            // After it has bootstrapped, we can call
            this.walletTransactionsAggregator.processWalletDepositsAggregations();

        } catch (errorProcessingTransactionFile) {
            console.error(`ERROR: Couldn't process transaction file on bootstrap: ${errorProcessingTransactionFile}`);
            console.error("INFO: Make sure that all resources are connected for proper execution...")
        }
    }

    /**
     * Event handler when the watched directory has changed. It returns the event of the change and the file name.
     *
     * @param {String} eventType is either "rename" or "change". The former is ignored as it is
     * fired twice when the file.
     * @param {String} filename is the name of the string, without the directory path is created.
     */
    onFileChange = function(eventType, filename) {
        console.log(`INFO: Async file-system event triggered: eventType=${eventType}, filename=${filename}`);

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
        this._checkTransactionFile(potentialFilePath).then(() => {
            console.log(`Finished processing transaction from '${potentialFilePath}'.`)
        });
    }

    /**
     * Handles the given transaction filePath after the validation, providing the flag if it was
     * captured during the bootstrap or not.
     *
     * When in bootstrap mode, it will process all files before producing the report.
     *
     * @param {String} filePath the full path of the file in the file-system.
     * @param {String} bootstrapping whether or not the file was handling during bootstrap.
     */
    async processTransaction(filePath, bootstrapping) {
        console.log(`The transaction file=${filePath} will be parsed...`);

        let parsedValidDepositsByWallets = null;
        try {
            parsedValidDepositsByWallets = await this.transactionsParser.parse(filePath);

        } catch (errorParsingTransactions) {
            console.error(`Error parsing transaction files: ${errorParsingTransactions}`);
            throw errorParsingTransactions;
        }

        try {
            // // Bulk upsert all the wallet addresses before saving the transactions
            const bulkSaveResult = await this.transactionsDataRecorder.saveWalletAddresses(parsedValidDepositsByWallets);
            console.log(`Saved ${bulkSaveResult.data.length} wallet addresses from datafile '${filePath}'`);

        } catch (errorSavingWallets) {
            console.error(`Error saving the wallets: ${errorSavingWallets}`);
            throw errorSavingWallets;
        }

        try {
            // // Now, bulk upsert all the transactions from all wallets
            const bulkTransactionsResult = await this.transactionsDataRecorder.saveWalletTransactions(parsedValidDepositsByWallets);
            console.log(`Saved ${bulkTransactionsResult.data.length} wallet transactions from datafile '${filePath}'!`);

        } catch (errorWhileSavingTransactions) {
            console.error(`Couldn't save wallets transactions: ${errorWhileSavingTransactions}`);
            throw errorWhileSavingTransactions;
        }

        if (!bootstrapping) {
            // Aggregate the values based on the current state
            this.walletTransactionsAggregator.processWalletDepositsAggregations();
        }
    }
}

module.exports = KrakenTransactionsFileWatcher