const Joi = require("joi");

const embeddingSchema = Joi.object({
    embedding: Joi.array().items(Joi.number()).min(10).required(),
    source: Joi.string().valid("camera", "upload", "imported").required(),
    cameraId: Joi.number().allow(null),
    createdAt: Joi.date().optional(),
    qualityScore: Joi.number().min(0).max(1).required(),
    thumbnail: Joi.string().allow(null)
}).unknown(false);

const personSchema = Joi.object({
    _id: Joi.number().optional(),
    userId: Joi.number().required(),
    displayName: Joi.string().min(2).required(),
    tags: Joi.array().items(Joi.string()).default([]),
    riskLevel: Joi.string().valid("LOW", "MEDIUM", "HIGH").required(),
    metadata: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
    embeddings: Joi.array().items(embeddingSchema).default([])
}).unknown(false);

module.exports = {
    validatePerson: (data) => personSchema.validate(data, { abortEarly: false }),
    validateEmbedding: (data) => embeddingSchema.validate(data, { abortEarly: false }),
};
