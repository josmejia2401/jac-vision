const Joi = require("joi");

const statusSchema = Joi.object({
    id: Joi.number()
        .integer()
        .required()
        .messages({
            "number.base": "El campo 'status.id' debe ser un número.",
            "any.required": "El campo 'status.id' es obligatorio."
        }),

    name: Joi.string()
        .trim()
        .required()
        .messages({
            "string.base": "El campo 'status.name' debe ser texto.",
            "string.empty": "El campo 'status.name' no puede estar vacío.",
            "any.required": "El campo 'status.name' es obligatorio."
        })
}).unknown(false);

const verificationFlowSchema = Joi.object({
    type: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "El campo 'type' es obligatorio.",
            "string.empty": "El campo 'type' no puede estar vacío."
        }),

    token: Joi.string()
        .required()
        .messages({
            "any.required": "El campo 'token' es obligatorio.",
            "string.empty": "El campo 'token' no puede estar vacío."
        }),

    expiresAt: Joi.date()
        .required()
        .messages({
            "date.base": "'expiresAt' debe ser una fecha válida.",
            "any.required": "El campo 'expiresAt' es obligatorio."
        }),

    createdAt: Joi.date().optional(),

    attempts: Joi.number()
        .min(0)
        .default(0)
        .messages({
            "number.base": "El campo 'attempts' debe ser numérico.",
            "number.min": "El campo 'attempts' no puede ser negativo."
        })
}).unknown(false);

const securitySchema = Joi.object({
    loginAttempts: Joi.number()
        .min(0)
        .messages({
            "number.base": "El campo 'security.loginAttempts' debe ser un número.",
            "number.min": "El campo 'security.loginAttempts' no puede ser negativo."
        }),

    lockedUntil: Joi.date()
        .allow(null)
        .messages({
            "date.base": "El campo 'security.lockedUntil' debe ser una fecha válida."
        }),

    lastLoginAt: Joi.date()
        .allow(null)
        .messages({
            "date.base": "El campo 'security.lastLoginAt' debe ser una fecha válida."
        }),

    roles: Joi.array()
        .items(
            Joi.string()
                .trim()
                .messages({
                    "string.base": "Cada rol debe ser texto válido."
                })
        )
}).unknown(false);


const createUserSchema = Joi.object({

    firstName: Joi.string()
        .trim()
        .min(2)
        .required()
        .messages({
            "string.base": "El campo 'firstName' debe ser texto.",
            "string.empty": "El campo 'firstName' no puede estar vacío.",
            "string.min": "El campo 'firstName' debe tener al menos 2 caracteres.",
            "any.required": "El campo 'firstName' es obligatorio."
        }),

    lastName: Joi.string()
        .trim()
        .min(2)
        .required()
        .messages({
            "string.base": "El campo 'lastName' debe ser texto.",
            "string.empty": "El campo 'lastName' no puede estar vacío.",
            "string.min": "El campo 'lastName' debe tener al menos 2 caracteres.",
            "any.required": "El campo 'lastName' es obligatorio."
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .trim()
        .required()
        .messages({
            "string.email": "El correo electrónico no tiene un formato válido.",
            "any.required": "El campo 'email' es obligatorio."
        }),

    phoneNumber: Joi.string().required().messages({
        'string.base': 'El número de teléfono debe ser una cadena de texto.',
        'string.empty': 'El número de teléfono no puede estar vacío.',
        'any.required': 'El número de teléfono es obligatorio.',
    }),

    username: Joi.string()
        .min(3)
        .trim()
        .required()
        .messages({
            "string.base": "El campo 'username' debe ser texto.",
            "string.min": "El campo 'username' debe tener al menos 3 caracteres.",
            "any.required": "El campo 'username' es obligatorio."
        }),

    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "La contraseña debe tener mínimo 8 caracteres.",
            "any.required": "La contraseña es obligatoria."
        }),

    security: securitySchema.optional(),

    status: statusSchema.optional(),

    previousStatus: statusSchema.allow(null).optional(),

    verificationFlows: Joi.array()
        .items(verificationFlowSchema)
        .default([])
}).unknown(false);


const updateUserSchema = Joi.object({
    firstName: Joi.string().min(2).trim().messages({
        "string.min": "El nombre debe tener al menos 2 caracteres."
    }),

    lastName: Joi.string().min(2).trim().messages({
        "string.min": "El apellido debe tener al menos 2 caracteres."
    }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .trim()
        .messages({
            "string.email": "El correo electrónico no tiene un formato válido."
        }),

    phoneNumber: Joi.string().required().messages({
        'string.base': 'El número de teléfono debe ser una cadena de texto.',
        'string.empty': 'El número de teléfono no puede estar vacío.',
        'any.required': 'El número de teléfono es obligatorio.',
    }),

    username: Joi.string().min(3).trim().messages({
        "string.min": "El nombre de usuario debe tener al menos 3 caracteres."
    }),

    status: statusSchema,
    previousStatus: statusSchema.allow(null),

    security: securitySchema
})
    .unknown(false)
    .min(1)
    .messages({
        "object.min": "Debe proporcionar al menos un campo para actualizar."
    });

const updatePasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "La nueva contraseña debe tener mínimo 8 caracteres.",
            "any.required": "La nueva contraseña es obligatoria."
        }),
    newPassword: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "La nueva contraseña debe tener mínimo 8 caracteres.",
            "any.required": "La nueva contraseña es obligatoria."
        })
}).unknown(false);

module.exports = {
    updatePasswordSchema: updatePasswordSchema,
    updateUserSchema: updateUserSchema,
    createUserSchema: createUserSchema
};
