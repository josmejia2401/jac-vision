const baseLogger = require('./logger');

/**
 * Devuelve un logger vinculado a un requestId
 * @param {string} requestId
 */
function getRequestLogger(requestId) {
    return {
        info: (...args) => baseLogger.info(requestId, ...args),
        warn: (...args) => baseLogger.warn(requestId, ...args),
        error: (...args) => baseLogger.error(requestId, ...args),
        debug: (...args) => baseLogger.debug(requestId, ...args),
        log: (...args) => baseLogger.debug(requestId, ...args)
    };
}

module.exports = {
    getRequestLogger
};
