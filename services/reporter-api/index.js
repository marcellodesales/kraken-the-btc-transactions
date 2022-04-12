import { loggers } from 'winston';
import config from './config/config';
import app from './config/express';
/* eslint-disable no-unused-vars */

const debug = require('debug')(`${config.name}:index`);
/* eslint-enable no-unused-vars */

// Get default logger
const logger = loggers.get(config.name); // eslint-disable-line no-global-assign

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// module.parent check is required to support mocha watch
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    logger.info(`Service started on port ${config.port} (${config.env})`, {
      port: config.port,
      node_env: config.env,
    });
  });
}

export default app;
