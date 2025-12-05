// src/utils/errors/not-found-exception.js
class NotFoundException extends Error {
    constructor(message = "Recurso no encontrado") {
        super(message);
        this.status = 404;
    }
}

module.exports = NotFoundException;
