/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

const os = require("os");

/**
 * Resolves paths that start with a tilde to the user's home directory.
 *
 * @see https://stackoverflow.com/questions/21077670/expanding-resolving-in-node-js/57243075#57243075
 * @param  {string} filePath '~/GitHub/Repo/file.png'
 * @return {string}          '/home/bob/GitHub/Repo/file.png'
 */
const resolveTilde = function(filePath) {
    if (!filePath || typeof(filePath) !== 'string') {
        return '';
    }

    // '~/folder/path' or '~' not '~alias/folder/path'
    if (filePath.startsWith('~/') || filePath === '~') {
        return filePath.replace('~', os.homedir());
    }

    return filePath;
}

module.exports = {
    resolveTilde
}