const mongoose = require("mongoose");
const dns = require("dns");
const constants = require("../helpers/utils/constants/constants");
const { getRequestLogger } = require("../helpers/utils/logger/request-logger");

class MongoDBClient {

    constructor() {
        this.logger = getRequestLogger("mongo");
        this.ready = false;
        this.mongoose = null;
        this.MONGO_URI = constants.DATABASE_URL;

        if (!this.MONGO_URI) {
            this.logger.error("MONGO_URI no está definida.");
            process.exit(1);
        }

        this.#registerEvents();
    }

    #registerEvents() {
        mongoose.connection.on("connected", () => {
            this.ready = true;
            this.logger.info("MongoDB conectado.");
        });

        mongoose.connection.on("error", (err) => {
            this.ready = false;
            this.logger.error("Error en MongoDB:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            this.ready = false;
            this.logger.warn("MongoDB desconectado.");
        });

        mongoose.connection.on("reconnectFailed", () => {
            this.ready = false;
            this.logger.error("Falló la reconexión a MongoDB.");
        });
    }

    async connect() {
        this.logger.info(`Intentando conectar a MongoDB: ${this.MONGO_URI}`);

        try {
            // DNS personalizado para evitar SRV/TXT fallidos
            //dns.setServers(["8.8.8.8", "1.1.1.1"]);

            this.mongoose = await mongoose.connect(this.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 10,
                minPoolSize: 1,
                connectTimeoutMS: 15000,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                tls: true,
                tlsAllowInvalidCertificates: true,
                serverApi: { version: mongoose.mongo.ServerApiVersion.v1, strict: true, deprecationErrors: true }
            });

            this.ready = true;
            this.logger.info("MongoDB listo para usar", this.MONGO_URI);
            return true;

        } catch (error) {
            this.ready = false;
            this.logger.error("Error al conectar MongoDB:", error.message);
            return false;
        }
    }

    isReady() {
        return this.ready;
    }

    async close() {
        await mongoose.connection.close();
        this.logger.info("Conexión MongoDB cerrada.");
    }
}

const mongoDBClient = new MongoDBClient();

process.on("SIGINT", async () => {
    await mongoDBClient.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await mongoDBClient.close();
    process.exit(0);
});

module.exports = { mongoDBClient, mongoose: mongoDBClient.mongoose };
