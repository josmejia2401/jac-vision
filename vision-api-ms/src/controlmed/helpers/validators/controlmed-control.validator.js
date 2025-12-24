const Joi = require("joi");

const createControlSchema = Joi.object({
    dependentId: Joi.number()
        .integer()
        .min(1)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'El ID del dependiente debe ser un número.',
            'number.integer': 'El ID del dependiente debe ser un número entero.',
            'number.min': 'El ID del dependiente debe ser mayor que 0.'
        }),

    recordType: Joi.string()
        .valid('CONSULTATION', 'ORDER', 'EXAM', 'MEDICATION', 'DIAGNOSIS', 'CONTROL')
        .required()
        .messages({
            'string.base': 'El tipo de registro debe ser texto.',
            'any.only': 'El tipo de registro debe ser uno de: CONSULTATION, ORDER, EXAM, MEDICATION, DIAGNOSIS o CONTROL.',
            'any.required': 'El tipo de registro es obligatorio.'
        }),

    title: Joi.string()
        .max(200)
        .required()
        .messages({
            'string.empty': 'El título es obligatorio.',
            'string.max': 'El título no puede superar los 200 caracteres.'
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'La descripción no puede superar los 1000 caracteres.'
        }),

    date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'La fecha debe ser una fecha válida.',
            'date.format': 'La fecha debe tener formato ISO (YYYY-MM-DD).',
            'any.required': 'La fecha es obligatoria.'
        }),

    doctorName: Joi.string()
        .max(150)
        .allow('', null)
        .messages({
            'string.max': 'El nombre del médico no puede superar los 150 caracteres.'
        }),

    specialty: Joi.string()
        .max(100)
        .allow('', null)
        .messages({
            'string.max': 'La especialidad no puede superar los 100 caracteres.'
        }),

    healthCenter: Joi.string()
        .max(200)
        .allow('', null)
        .messages({
            'string.max': 'El centro médico no puede superar los 200 caracteres.'
        }),

    notes: Joi.string().max(1000).allow('', null)
        .messages({
            'string.max': 'Las notas no pueden superar los 1000 caracteres.'
        }),

    createdAt: Joi.date().iso().default(() => new Date().toISOString())
        .messages({ 'date.base': 'La fecha de creación debe ser válida.' }),

    updatedAt: Joi.date().iso().default(() => new Date().toISOString())
        .messages({ 'date.base': 'La fecha de actualización debe ser válida.' }),

    // ===============================
    // 📎 Archivos adjuntos
    // ===============================
    attachments: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().required()
                    .messages({
                        'any.required': 'El id del archivo es obligatorio.'
                    }),
                fileName: Joi.string().max(255).required()
                    .messages({
                        'string.max': 'El nombre del archivo no puede superar los 255 caracteres.',
                        'any.required': 'El nombre del archivo es obligatorio.'
                    }),
                mimeType: Joi.string().max(100).required()
                    .messages({
                        'string.max': 'El tipo MIME no puede superar los 100 caracteres.',
                        'any.required': 'El tipo MIME es obligatorio.'
                    }),
                size: Joi.number().integer().min(1).required()
                    .messages({
                        'number.base': 'El tamaño del archivo debe ser un número.',
                        'number.min': 'El tamaño del archivo debe ser mayor que 0.',
                        'any.required': 'El tamaño del archivo es obligatorio.'
                    }),
                url: Joi.string().allow('', null)
                    .messages({ 'string.uri': 'La URL del archivo debe ser válida.' })
            })
        )
        .default([])
        .messages({
            'array.base': 'El campo de archivos adjuntos debe ser una lista válida.'
        }),

    // ===============================
    // 🩺 CONTROL (Seguimiento médico)
    // ===============================
    control: Joi.object({
        controlReason: Joi.string().max(300).required()
            .messages({
                'string.max': 'El motivo del control no puede superar los 300 caracteres.',
                'any.required': 'El motivo del control es obligatorio.'
            }),
        previousRecordId: Joi.string().uuid().allow('', null)
            .messages({ 'string.guid': 'El ID del registro previo debe tener formato UUID válido.' }),
        scheduledDate: Joi.date().iso().required()
            .messages({
                'date.base': 'La fecha programada debe ser una fecha válida.',
                'any.required': 'La fecha programada es obligatoria.'
            }),
        attendedDate: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de atención debe ser una fecha válida.' }),
        status: Joi.string().valid('SCHEDULED', 'DONE', 'CANCELLED').default('SCHEDULED')
            .messages({
                'any.only': 'El estado debe ser SCHEDULED, DONE o CANCELLED.'
            }),
        observations: Joi.string().max(1000).allow('', null)
            .messages({ 'string.max': 'Las observaciones no pueden superar los 1000 caracteres.' })
    }).required()
        .messages({
            'any.required': 'El objeto de control médico es obligatorio.'
        }),

}).unknown(false);

const updateControlSchema = Joi.object({
    dependentId: Joi.number()
        .integer()
        .min(1)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'El ID del dependiente debe ser un número.',
            'number.integer': 'El ID del dependiente debe ser un número entero.',
            'number.min': 'El ID del dependiente debe ser mayor que 0.'
        }),

    recordType: Joi.string()
        .valid('CONSULTATION', 'ORDER', 'EXAM', 'MEDICATION', 'DIAGNOSIS', 'CONTROL')
        .required()
        .messages({
            'string.base': 'El tipo de registro debe ser texto.',
            'any.only': 'El tipo de registro debe ser uno de: CONSULTATION, ORDER, EXAM, MEDICATION, DIAGNOSIS o CONTROL.',
            'any.required': 'El tipo de registro es obligatorio.'
        }),

    title: Joi.string()
        .max(200)
        .required()
        .messages({
            'string.empty': 'El título es obligatorio.',
            'string.max': 'El título no puede superar los 200 caracteres.'
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'La descripción no puede superar los 1000 caracteres.'
        }),

    date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'La fecha debe ser una fecha válida.',
            'date.format': 'La fecha debe tener formato ISO (YYYY-MM-DD).',
            'any.required': 'La fecha es obligatoria.'
        }),

    doctorName: Joi.string()
        .max(150)
        .allow('', null)
        .messages({
            'string.max': 'El nombre del médico no puede superar los 150 caracteres.'
        }),

    specialty: Joi.string()
        .max(100)
        .allow('', null)
        .messages({
            'string.max': 'La especialidad no puede superar los 100 caracteres.'
        }),

    healthCenter: Joi.string()
        .max(200)
        .allow('', null)
        .messages({
            'string.max': 'El centro médico no puede superar los 200 caracteres.'
        }),

    notes: Joi.string().max(1000).allow('', null)
        .messages({
            'string.max': 'Las notas no pueden superar los 1000 caracteres.'
        }),

    createdAt: Joi.date().iso().default(() => new Date().toISOString())
        .messages({ 'date.base': 'La fecha de creación debe ser válida.' }),

    updatedAt: Joi.date().iso().default(() => new Date().toISOString())
        .messages({ 'date.base': 'La fecha de actualización debe ser válida.' }),


    // ===============================
    // 📎 Archivos adjuntos
    // ===============================
    attachments: Joi.array()
        .items(
            Joi.object({
                id: Joi.number().required()
                    .messages({
                        'any.required': 'El id del archivo es obligatorio.'
                    }),
                fileName: Joi.string().max(255).required()
                    .messages({
                        'string.max': 'El nombre del archivo no puede superar los 255 caracteres.',
                        'any.required': 'El nombre del archivo es obligatorio.'
                    }),
                mimeType: Joi.string().max(100).required()
                    .messages({
                        'string.max': 'El tipo MIME no puede superar los 100 caracteres.',
                        'any.required': 'El tipo MIME es obligatorio.'
                    }),
                size: Joi.number().integer().min(1).required()
                    .messages({
                        'number.base': 'El tamaño del archivo debe ser un número.',
                        'number.min': 'El tamaño del archivo debe ser mayor que 0.',
                        'any.required': 'El tamaño del archivo es obligatorio.'
                    }),
                url: Joi.string().allow('', null)
                    .messages({ 'string.uri': 'La URL del archivo debe ser válida.' })
            })
        )
        .default([])
        .messages({
            'array.base': 'El campo de archivos adjuntos debe ser una lista válida.'
        }),

    // ===============================
    // 🩺 CONTROL (Seguimiento médico)
    // ===============================
    control: Joi.object({
        controlReason: Joi.string().max(300).required()
            .messages({
                'string.max': 'El motivo del control no puede superar los 300 caracteres.',
                'any.required': 'El motivo del control es obligatorio.'
            }),
        previousRecordId: Joi.string().uuid().allow('', null)
            .messages({ 'string.guid': 'El ID del registro previo debe tener formato UUID válido.' }),
        scheduledDate: Joi.date().iso().required()
            .messages({
                'date.base': 'La fecha programada debe ser una fecha válida.',
                'any.required': 'La fecha programada es obligatoria.'
            }),
        attendedDate: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de atención debe ser una fecha válida.' }),
        status: Joi.string().valid('SCHEDULED', 'DONE', 'CANCELLED').default('SCHEDULED')
            .messages({
                'any.only': 'El estado debe ser SCHEDULED, DONE o CANCELLED.'
            }),
        observations: Joi.string().max(1000).allow('', null)
            .messages({ 'string.max': 'Las observaciones no pueden superar los 1000 caracteres.' })
    }).required()
        .messages({
            'any.required': 'El objeto de control médico es obligatorio.'
        }),
})
    .min(1)
    .unknown(false);

module.exports = {
    createControlSchema,
    updateControlSchema
};
