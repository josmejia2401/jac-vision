const Redis = require("ioredis");
const constants = require("../helpers/utils/constants/constants");
const { getRequestLogger } = require("../helpers/utils/logger/request-logger");

class RedisClient {
    constructor() {
        this.logger = getRequestLogger("redis");
        this.ready = false;

        const enableTLS = constants.REDIS_USE_TLS === "true";

        const options = {
            lazyConnect: true,
            connectTimeout: 10000,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            retryStrategy: (times) => Math.min(times * 100, 2000),
            ...(enableTLS && { tls: {} })
        };

        this.client = new Redis.Redis(constants.REDIS_URL, options);

        this.#registerEvents();
    }

    #registerEvents() {
        this.client.on("connect", () => {
            this.logger.info("Redis conectado (tcp)...");
        });

        this.client.on("ready", () => {
            this.ready = true;
            this.logger.info("Redis READY — listo para recibir comandos");
        });

        this.client.on("reconnecting", () => {
            this.ready = false;
            this.logger.warn("Redis reconectando...");
        });

        this.client.on("end", () => {
            this.ready = false;
            this.logger.warn("Redis desconectado");
        });

        this.client.on("error", (err) => {
            this.ready = false;
            this.logger.error("Redis error:", err);
        });
    }

    async connect() {
        this.logger.info("Intentando conectar a Redis...");

        try {
            await this.client.connect();
            return true;
        } catch (err) {
            this.logger.error("Redis no conectó:", err.message);
            return false;
        }
    }
    
    isReady() {
        return this.ready;
    }

    async safeSet(key, value, ttlSeconds = null) {
        if (!this.ready) return false;
        return ttlSeconds
            ? this.client.set(key, value, "EX", ttlSeconds)
            : this.client.set(key, value);
    }

    async safeGet(key) {
        if (!this.ready) return null;
        return this.client.get(key);
    }
}

const redisClient = new RedisClient();

module.exports = { redisClient, redis: redisClient.client };
