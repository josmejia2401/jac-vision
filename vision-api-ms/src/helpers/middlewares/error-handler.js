const ApiError = require("../utils/errors/api-error");
const BusinessException = require("../utils/errors/business-exception");
const NotFoundException = require("../utils/errors/not-found-exception");
const { getRequestLogger } = require("../utils/logger/request-logger");

module.exports = function globalErrorHandler(err, req, res, next) {
    const logger = getRequestLogger(req.requestId);
    if (err.isJoi) {
        const formatted = err.details.map(e => ({
            field: e.path.join("."),
            message: e.message
        }));

        logger.warn(`Validation error:`, formatted);
        const apiError = new ApiError({
            status: 400,
            error: "Bad Request",
            message: "Los datos enviados no son válidos",
            errors: formatted
        });

        return res.status(400).json(apiError);
    }

    if (err instanceof BusinessException) {
        logger.warn(`Business exception: ${err.message}`);

        const apiError = new ApiError({
            status: err.status,
            error: "Business Error",
            message: err.message
        });
        return res.status(err.status).json(apiError);
    }

    if (err instanceof NotFoundException) {
        logger.warn(`Not found: ${err.message}`);

        const apiError = new ApiError({
            status: 404,
            error: "Not Found",
            message: err.message
        });
        return res.status(404).json(apiError);
    }

    if (err.code === 11000) {
        const duplicatedField = Object.keys(err.keyPattern)[0];
        const duplicatedValue = err.keyValue[duplicatedField];

        logger.warn(`Duplicate key: ${duplicatedField}=${duplicatedValue}`);

        const apiError = new ApiError({
            status: 409,
            error: "Duplicate Key",
            message: `El valor '${duplicatedValue}' ya está registrado en el campo '${duplicatedField}'.`
        });
        return res.status(409).json(apiError);
    }

    if (err.name === "MongoTimeoutError") {
        logger.error("Mongo Timeout:", err);

        const apiError = new ApiError({
            status: 504,
            error: "Database Timeout",
            message: "Tiempo de espera agotado al conectarse a la base de datos."
        });
        return res.status(504).json(apiError);
    }

    if (err.name && err.name.startsWith("Mongo")) {
        logger.error("Mongo error:", err);

        const apiError = new ApiError({
            status: 500,
            error: "Database Error",
            message: "Error interno al comunicarse con la base de datos."
        });
        return res.status(500).json(apiError);
    }

    logger.error("Unexpected error:", err);

    const apiError = new ApiError({
        status: 500,
        error: "Internal Server Error",
        message: "Ocurrió un error inesperado. Contacte al soporte técnico."
    });
    return res.status(500).json(apiError);
};
