const Joi = require("joi");

const createOrderSchema = Joi.object({
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
    // 🧾 ORDER (Órdenes médicas / Fórmulas)
    // ===============================
    prescription: Joi.object({
        prescriptionType: Joi.string()
            .valid('ACUTE', 'CONTINUOUS')
            .required()
            .messages({
                'any.only': 'El tipo de fórmula debe ser ACUTE (aguda) o CONTINUOUS (continua).',
                'any.required': 'El tipo de fórmula es obligatorio.'
            }),
        validityStart: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de inicio de vigencia debe ser válida.' }),
        validityEnd: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de fin de vigencia debe ser válida.' }),
        diagnosisCode: Joi.string().max(20).allow('', null)
            .messages({ 'string.max': 'El código del diagnóstico no puede superar los 20 caracteres.' }),
        diagnosisName: Joi.string().max(200).allow('', null)
            .messages({ 'string.max': 'El nombre del diagnóstico no puede superar los 200 caracteres.' }),
        medications: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().max(150).required().messages({
                        'string.base': 'El nombre del medicamento debe ser un texto.',
                        'any.required': 'El nombre del medicamento es obligatorio.'
                    }),
                    presentation: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La presentación no puede superar los 100 caracteres.' }),
                    dosage: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La dosis no puede superar los 100 caracteres.' }),
                    frequency: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La frecuencia no puede superar los 100 caracteres.' }),
                    duration: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La duración no puede superar los 50 caracteres.' }),
                    totalQuantity: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La cantidad total no puede superar los 50 caracteres.' }),
                    notes: Joi.string().max(300).allow('', null)
                        .messages({ 'string.max': 'Las notas del medicamento no pueden superar los 300 caracteres.' })
                })
            )
            .required()
            .messages({
                'array.base': 'La lista de medicamentos debe ser una lista válida.',
                'any.required': 'La lista de medicamentos es obligatoria.'
            }),

    }).required()
        .messages({
            'any.required': 'El objeto de fórmula médica es obligatorio.'
        }),
}).unknown(false);

const updateOrderSchema = Joi.object({
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
    // 🧾 ORDER (Órdenes médicas / Fórmulas)
    // ===============================
    prescription: Joi.object({
        prescriptionType: Joi.string()
            .valid('ACUTE', 'CONTINUOUS')
            .required()
            .messages({
                'any.only': 'El tipo de fórmula debe ser ACUTE (aguda) o CONTINUOUS (continua).',
                'any.required': 'El tipo de fórmula es obligatorio.'
            }),
        validityStart: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de inicio de vigencia debe ser válida.' }),
        validityEnd: Joi.date().iso().allow('', null)
            .messages({ 'date.base': 'La fecha de fin de vigencia debe ser válida.' }),
        diagnosisCode: Joi.string().max(20).allow('', null)
            .messages({ 'string.max': 'El código del diagnóstico no puede superar los 20 caracteres.' }),
        diagnosisName: Joi.string().max(200).allow('', null)
            .messages({ 'string.max': 'El nombre del diagnóstico no puede superar los 200 caracteres.' }),
        medications: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().max(150).required().messages({
                        'string.base': 'El nombre del medicamento debe ser un texto.',
                        'any.required': 'El nombre del medicamento es obligatorio.'
                    }),
                    presentation: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La presentación no puede superar los 100 caracteres.' }),
                    dosage: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La dosis no puede superar los 100 caracteres.' }),
                    frequency: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'La frecuencia no puede superar los 100 caracteres.' }),
                    duration: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La duración no puede superar los 50 caracteres.' }),
                    totalQuantity: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La cantidad total no puede superar los 50 caracteres.' }),
                    notes: Joi.string().max(300).allow('', null)
                        .messages({ 'string.max': 'Las notas del medicamento no pueden superar los 300 caracteres.' })
                })
            )
            .required()
            .messages({
                'array.base': 'La lista de medicamentos debe ser una lista válida.',
                'any.required': 'La lista de medicamentos es obligatoria.'
            }),

    }).required()
        .messages({
            'any.required': 'El objeto de fórmula médica es obligatorio.'
        }),
})
    .min(1)
    .unknown(false)
    .messages({ "object.min": "Debe proporcionar al menos un campo para actualizar." });

module.exports = {
    createOrderSchema,
    updateOrderSchema
};
