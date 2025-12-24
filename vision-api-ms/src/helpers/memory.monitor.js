const logger = require('./utils/logger/request-logger');

module.exports = function startMemoryMonitor() {
    setInterval(() => {
        const memory = process.memoryUsage();
        logger.getRequestLogger("memory").log("[MEMORIA]", {
            rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
        });
    }, 60_000);
};
