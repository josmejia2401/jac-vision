// src/utils/errors/business-exception.js
class BusinessException extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

module.exports = BusinessException;
