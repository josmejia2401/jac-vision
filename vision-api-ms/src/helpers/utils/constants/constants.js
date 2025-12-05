module.exports = {
    DATABASE_URL: process.env.DATABASE_URL,

    REDIS_URL: process.env.REDIS_URL,
    REDIS_USER: process.env.REDIS_USER,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USE_TLS: process.env.REDIS_USE_TLS,

    JWT_SECRET_VALUE: process.env.JWT_SECRET_VALUE,
    JWT_TOKEN_LIFE: process.env.JWT_TOKEN_LIFE,

    SESSION_SECRET: process.env.SESSION_SECRET,

    NODE_ENV: process.env.NODE_ENV || 'dev',
    APP_NAME: process.env.APP_NAME,
    LOGGER_LEVEL: process.env.LOGGER_LEVEL,
    ENVIRONMENT: process.env.ENVIRONMENT || 'dev',

    PORT: process.env.PORT || 3000,

    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 300,

    STORAGE_BASE_PATH: process.env.STORAGE_BASE_PATH,
    DIR_LOGGER: process.env.DIR_LOGGER,
};
