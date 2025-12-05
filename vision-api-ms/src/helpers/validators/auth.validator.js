const Joi = require("joi");


const logInSchema = Joi.object({
    audience: Joi.string().valid("app", "web").required()
        .messages({
            'any.required': 'La "audience" es obligatoria',
            'string.empty': 'La "audience" no puede estar vacía',
            'any.only': 'El valor de "audience" debe ser app o web'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "La nueva contraseña debe tener mínimo 8 caracteres.",
            "any.required": "La nueva contraseña es obligatoria."
        }),
    username: Joi.string()
        .min(3)
        .required()
        .messages({
            "string.min": "El  usuario debe tener mínimo 3 caracteres.",
            "any.required": "El usuario es obligatoria."
        })
}).unknown(false);

const logOutSchema = Joi.object({
    authorization: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "La Authorization debe tener mínimo 8 caracteres.",
            "any.required": "La Authorization es obligatoria."
        }),
}).unknown(false);

module.exports = {
    logInSchema: logInSchema,
    logOutSchema: logOutSchema
};
