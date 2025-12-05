// src/utils/errors/api-error.js
class ApiError {
    constructor({ status, error, message, errors = null }) {
        this.timestamp = new Date().toISOString();
        this.status = status;
        this.error = error;
        this.message = message;
        if (errors) this.errors = errors;
    }
}

module.exports = ApiError;
