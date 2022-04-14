/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    TRANSACTIONS_WATCHER_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development')
        .description('The node environment variable'),


    TRANSACTIONS_WATCHER_SERVICE_NAME: Joi.string()
        .default('kraken-transactions-file-watcher')
        .description('Service name for logging and identification'),

    TRANSACTIONS_WATCHER_API_VERSION: Joi.string()
        .default('1.0')
        .description('API Version of the service'),

    TRANSACTIONS_WATCHER_HEALTHCHECK_FILE_PATH: Joi.string()
        .default("/tmp/kraken-transactions-healthcheck")
        .description('The file path used for healthcheck'),

    TRANSACTIONS_WATCHER_DIR_TO_WATCH: Joi.string()
        .default('./data')
        .description('The directory to watch for transactions data'),

    TRANSACTIONS_WATCHER_FILE_EXTENSION: Joi.string()
        .default(".json")
        .description('The file extension to watch under the watch dir'),

    TRANSACTIONS_DATA_SERVICE_ADDRESS:Joi.string()
        .default("http://localhost:4565")
        .description('The host:port of the postgREST data service to store transactions')

}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

// if test, use test database
const isTestEnvironment = envVars.NODE_ENV === 'test';

const config = {
    // the env driven config
    env: envVars.TRANSACTIONS_WATCHER_ENV,
    name: envVars.TRANSACTIONS_WATCHER_SERVICE_NAME,
    apiVersion: envVars.TRANSACTIONS_WATCHER_API_VERSION,
    healthcheckFile: envVars.TRANSACTIONS_WATCHER_HEALTHCHECK_FILE_PATH,
    dirToWatch: envVars.TRANSACTIONS_WATCHER_DIR_TO_WATCH,
    transactionsFileExtension: envVars.TRANSACTIONS_WATCHER_FILE_EXTENSION,
    transactionsDataServiceHost: envVars.TRANSACTIONS_DATA_SERVICE_ADDRESS,

    // additional config
    isTest: isTestEnvironment
};

module.exports = config;