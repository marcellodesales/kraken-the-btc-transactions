/**
 /* Copyright ©️ Marcello DeSales - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
 * Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
 */

/**
 * @returns {string} The decimal number from the scientific value.
 * @see https://stackoverflow.com/questions/18719775/parsing-and-converting-exponential-values-to-decimal-in-javascript/18719988#18719988
 */
function noExponents(n) {
    const data = String(n).split(/[eE]/);
    if (data.length == 1) return data[0];

    let z = '',
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

module.exports = {
    noExponents
}