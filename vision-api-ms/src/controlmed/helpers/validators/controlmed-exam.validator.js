const Joi = require("joi");

const createExamSchema = Joi.object({
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
    // 🧪 EXAM (Resultados de laboratorio o imagen)
    // ===============================
    exams: Joi.object({
        labName: Joi.string().max(200).allow('', null)
            .messages({ 'string.max': 'El nombre del laboratorio no puede superar los 200 caracteres.' }),
        validatedBy: Joi.string().max(150).allow('', null)
            .messages({ 'string.max': 'El nombre del profesional validador no puede superar los 150 caracteres.' }),
        tests: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().max(150).required().messages({
                        'any.required': 'El nombre del examen es obligatorio.',
                        'string.max': 'El nombre del examen no puede superar los 150 caracteres.'
                    }),
                    result: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El resultado no puede superar los 100 caracteres.' }),
                    unit: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La unidad no puede superar los 50 caracteres.' }),
                    referenceRange: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El rango de referencia no puede superar los 100 caracteres.' }),
                    method: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El método no puede superar los 100 caracteres.' }),
                    validationDate: Joi.date().iso().allow('', null)
                        .messages({ 'date.base': 'La fecha de validación debe ser válida.' })
                })
            )
            .required()
            .messages({
                'array.base': 'La lista de exámenes debe ser una lista válida.',
                'any.required': 'La lista de exámenes es obligatoria.'
            })
    }).required()
        .messages({
            'any.required': 'El objeto de resultados de examen es obligatorio.'
        })


}).unknown(false);

const updateExamSchema = Joi.object({
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
    // 🧪 EXAM (Resultados de laboratorio o imagen)
    // ===============================
    exams: Joi.object({
        labName: Joi.string().max(200).allow('', null)
            .messages({ 'string.max': 'El nombre del laboratorio no puede superar los 200 caracteres.' }),
        validatedBy: Joi.string().max(150).allow('', null)
            .messages({ 'string.max': 'El nombre del profesional validador no puede superar los 150 caracteres.' }),
        tests: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().max(150).required().messages({
                        'any.required': 'El nombre del examen es obligatorio.',
                        'string.max': 'El nombre del examen no puede superar los 150 caracteres.'
                    }),
                    result: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El resultado no puede superar los 100 caracteres.' }),
                    unit: Joi.string().max(50).allow('', null)
                        .messages({ 'string.max': 'La unidad no puede superar los 50 caracteres.' }),
                    referenceRange: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El rango de referencia no puede superar los 100 caracteres.' }),
                    method: Joi.string().max(100).allow('', null)
                        .messages({ 'string.max': 'El método no puede superar los 100 caracteres.' }),
                    validationDate: Joi.date().iso().allow('', null)
                        .messages({ 'date.base': 'La fecha de validación debe ser válida.' })
                })
            )
            .required()
            .messages({
                'array.base': 'La lista de exámenes debe ser una lista válida.',
                'any.required': 'La lista de exámenes es obligatoria.'
            })
    }).required()
        .messages({
            'any.required': 'El objeto de resultados de examen es obligatorio.'
        })

})
    .min(1)
    .unknown(false);

module.exports = {
    createExamSchema,
    updateExamSchema
};
