const fs = require('fs');
const path = require('path');
const constants = require('../constants/constants');

const ROOT_DIR = process.cwd();
const LOG_DIR = path.join(ROOT_DIR, constants.DIR_LOGGER);
const LOG_FILE = path.join(LOG_DIR, "app.log");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const COLORS = {
    reset: '\x1b[0m',
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m'  // red
};

function formatDate() {
    return new Date().toISOString();
}

function serialize(arg) {
    if (arg instanceof Error) {
        return `${arg.name}\t${arg.message}\n${arg.stack}`;
    } else if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
    }
    return String(arg);
}

function writeToFile(level, message) {
    const entry = `[${formatDate()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFile(LOG_FILE, entry, (err) => {
        if (err) console.error('[Logger] Error writing to file:', err);
    });
}

function log(level, requestId, ...args) {
    const color = COLORS[level] || '';
    const reset = COLORS.reset;

    const prefix = `[${formatDate()}] [${level.toUpperCase()}] [${requestId || 'unknown'}]`;
    const serialized = args.map(serialize).join(' ');
    const message = `${prefix} ${serialized}`;

    console.log(`${color}${message}${reset}`);
    writeToFile(level, serialized);
}

module.exports = {
    debug: (requestId, ...args) => log('debug', requestId, ...args),
    info: (requestId, ...args) => log('info', requestId, ...args),
    warn: (requestId, ...args) => log('warn', requestId, ...args),
    error: (requestId, ...args) => log('error', requestId, ...args),
    log: (requestId, ...args) => log('info', requestId, ...args)
};
