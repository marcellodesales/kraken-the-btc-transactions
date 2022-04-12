/**
 * express-validation exposes a version of Joi as a hard dependency,
 * in order to avoid compatibility issues with other versions of Joi.
 */
const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    TRANSACTIONS_WATCHER_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),

    TRANSACTIONS_WATCHER_PORT: Joi.number()
        .default(4000),

    TRANSACTIONS_WATCHER_SERVICE_NAME: Joi.string()
        .default('kraken-transactions-file-watcher')
        .description('Service name'),

    TRANSACTIONS_WATCHER_API_VERSION: Joi.string()
        .default('1.0')
        .description('API Version'),

    TRANSACTIONS_WATCHER_HEALTHCHECK_FILE_PATH: Joi.string()
        .default("/tmp/kraken-transactions-healthcheck"),

    TRANSACTIONS_WATCHER_DIR_TO_WATCH: Joi.string()
        .default('./data'),

    TRANSACTIONS_WATCHER_FILE_EXTENSION: Joi.string()
        .default(".json")

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
    port: envVars.TRANSACTIONS_WATCHER_PORT,
    name: envVars.TRANSACTIONS_WATCHER_SERVICE_NAME,
    apiVersion: envVars.TRANSACTIONS_WATCHER_API_VERSION,
    healthcheckFile: envVars.TRANSACTIONS_WATCHER_HEALTHCHECK_FILE_PATH,
    dirToWatch: envVars.TRANSACTIONS_WATCHER_DIR_TO_WATCH,
    transactionsFileExtension: envVars.TRANSACTIONS_WATCHER_FILE_EXTENSION,

    // additional config
    isTest: isTestEnvironment
};

module.exports = config;