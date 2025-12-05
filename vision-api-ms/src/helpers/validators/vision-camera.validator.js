const Joi = require("joi");

//
// Reglas reutilizables
//

const rtspRegex = /^rtsp:\/\/.+/i;

const baseCameraFields = {
    name: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.base": "El nombre debe ser texto.",
            "string.empty": "El nombre no puede estar vacío.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder 100 caracteres.",
            "any.required": "El nombre es obligatorio."
        }),

    rtspUrl: Joi.string()
        .pattern(rtspRegex)
        .required()
        .messages({
            "string.empty": "La URL RTSP no puede estar vacía.",
            "string.pattern.base": "La URL RTSP debe iniciar con 'rtsp://'.",
            "any.required": "La URL RTSP es obligatoria."
        }),

    snapshotUrl: Joi.string()
        .uri()
        .allow(null, "")
        .messages({
            "string.uri": "La URL del snapshot debe ser válida."
        }),

    location: Joi.string()
        .max(200)
        .allow(null, "")
        .messages({
            "string.max": "La ubicación no puede exceder 200 caracteres."
        }),

    metadata: Joi.object().default({})
};

//
// SCHEMA: Crear Cámara
//
const createCameraSchema = Joi.object({
    userId: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "El userId debe ser numérico.",
            "any.required": "El userId es obligatorio."
        }),

    ...baseCameraFields
}).unknown(false);


//
// SCHEMA: Actualizar Cámara (parcial)
//
const updateCameraSchema = Joi.object({
    name: baseCameraFields.name.optional(),
    rtspUrl: baseCameraFields.rtspUrl.optional(),
    snapshotUrl: baseCameraFields.snapshotUrl.optional(),
    location: baseCameraFields.location.optional(),
    metadata: baseCameraFields.metadata.optional()
})
    .min(1)
    .messages({
        "object.min": "Debe enviar al menos un campo para actualizar."
    })
    .unknown(false);


//
// SCHEMA: Cambiar estado (activar/inactivar)
//
const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .required()
        .messages({
            "any.only": "El estado debe ser ACTIVE o INACTIVE.",
            "any.required": "El estado es obligatorio."
        })
}).unknown(false);


//
// SCHEMA: Ping / Online
//
const updateOnlineSchema = Joi.object({
    isOnline: Joi.boolean().required(),
}).unknown(false);


module.exports = {
    createCameraSchema,
    updateCameraSchema,
    updateStatusSchema,
    updateOnlineSchema
};
