const Joi = require("joi");

const medicationSchema = Joi.object({
    name: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.base": "El nombre del medicamento debe ser texto.",
            "string.max": "El nombre del medicamento no puede superar los 100 caracteres.",
            "any.required": "El nombre del medicamento es obligatorio."
        }),

    dosage: Joi.string()
        .max(50)
        .allow("", null)
        .messages({
            "string.base": "La dosis debe ser texto.",
            "string.max": "La dosis no puede superar los 50 caracteres."
        }),

    frequency: Joi.string()
        .max(50)
        .allow("", null)
        .messages({
            "string.base": "La frecuencia debe ser texto.",
            "string.max": "La frecuencia no puede superar los 50 caracteres."
        })
}).unknown(false);

const createDependentSchema = Joi.object({

    _id: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "number.base": "El ID del usuario debe ser un número.",
            "number.integer": "El ID del usuario debe ser un número entero.",
            "number.min": "El ID del usuario debe ser mayor que 0.",
            "any.required": "El ID del usuario es obligatorio."
        }),

    userId: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "El ID del usuario debe ser un número.",
            "number.integer": "El ID del usuario debe ser un número entero.",
            "number.min": "El ID del usuario debe ser mayor que 0.",
            "any.required": "El ID del usuario es obligatorio."
        }),

    firstName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.base": "El nombre debe ser texto.",
            "string.min": "El nombre debe tener al menos 2 caracteres.",
            "string.max": "El nombre no puede superar los 100 caracteres.",
            "any.required": "El nombre es obligatorio."
        }),

    lastName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.base": "El apellido debe ser texto.",
            "string.min": "El apellido debe tener al menos 2 caracteres.",
            "string.max": "El apellido no puede superar los 100 caracteres.",
            "any.required": "El apellido es obligatorio."
        }),

    documentType: Joi.string()
        .valid("CC", "TI", "RC", "CE", "PA", "Otro")
        .required()
        .messages({
            "any.only": "El tipo de documento debe ser CC, TI, RC, CE, PA u Otro.",
            "any.required": "El tipo de documento es obligatorio."
        }),

    documentNumber: Joi.string()
        .pattern(/^[0-9A-Za-z-]+$/)
        .min(5)
        .max(20)
        .required()
        .messages({
            "string.pattern.base": "El número de documento solo puede contener letras, números y guiones.",
            "string.min": "El número de documento debe tener al menos 5 caracteres.",
            "string.max": "El número de documento no puede superar los 20 caracteres.",
            "any.required": "El número de documento es obligatorio."
        }),

    genderCode: Joi.string()
        .valid("MA", "FE", "OT", "PNS")
        .required()
        .messages({
            "any.only": "El género debe ser MA, FE, OT o PNS.",
            "any.required": "El género es obligatorio."
        }),

    birthDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de nacimiento debe ser una fecha válida.",
            "any.required": "La fecha de nacimiento es obligatoria."
        }),

    relationshipCode: Joi.string()
        .valid(
            "SON", "DAUGHTER", "HUSBAND", "WIFE",
            "FATHER", "MOTHER", "BROTHER", "SISTER", "OTHER"
        )
        .required()
        .messages({
            "any.only": "El parentesco no es válido.",
            "any.required": "El parentesco es obligatorio."
        }),

    bloodType: Joi.string()
        .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconocido")
        .default("Desconocido")
        .messages({
            "any.only": "El tipo de sangre no es válido."
        }),

    phone: Joi.string()
        .allow("", null)
        .messages({
            "string.base": "El teléfono debe ser texto."
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .allow("", null)
        .messages({
            "string.email": "El correo electrónico no tiene un formato válido."
        }),

    address: Joi.string()
        .max(200)
        .allow("", null)
        .messages({
            "string.max": "La dirección no puede superar los 200 caracteres."
        }),

    allergies: Joi.array()
        .items(Joi.string().max(100))
        .default([])
        .messages({
            "array.base": "El campo alergias debe ser una lista de textos."
        }),

    chronicConditions: Joi.array()
        .items(Joi.string().max(100))
        .default([])
        .messages({
            "array.base": "El campo enfermedades crónicas debe ser una lista de textos."
        }),

    medications: Joi.array()
        .items(medicationSchema)
        .default([])
        .messages({
            "array.base": "El campo medicamentos debe ser una lista válida."
        }),

    eps: Joi.string()
        .max(100)
        .allow("", null)
        .messages({
            "string.max": "El nombre de la EPS no puede superar los 100 caracteres."
        }),

    healthNotes: Joi.string()
        .max(500)
        .allow("", null)
        .messages({
            "string.max": "Las notas médicas no pueden superar los 500 caracteres."
        })

}).unknown(false);

const updateDependentSchema = createDependentSchema
    .fork(
        Object.keys(createDependentSchema.describe().keys),
        schema => schema.optional()
    )
    .min(1)
    .messages({
        "object.min": "Debe enviar al menos un campo para actualizar."
    });

module.exports = {
    createDependentSchema,
    updateDependentSchema
};
