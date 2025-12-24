const mongoose = require("mongoose");

const RISK_LEVEL = {
    NORMAL: "NORMAL",
    DANGEROUS: "DANGEROUS",
    HIGH: "HIGH",
    UNKNOWN: "UNKNOWN"
};

const FACE_SOURCE = {
    CAMERA: "CAMERA",
    MANUAL_UPLOAD: "MANUAL_UPLOAD",
    ARCHIVE: "ARCHIVE"
};

const FaceEmbeddingSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true
        },

        embedding: {
            type: [Number],
            required: true,
        },

        source: {
            type: String,
            enum: Object.values(FACE_SOURCE),
            required: true
        },

        cameraId: {
            type: Number,
            default: null
        },

        createdAt: {
            type: Date,
            default: Date.now
        },

        qualityScore: {
            type: Number,
            required: true
        },

        thumbnail: {
            type: String,
            default: null
        },
        metadata: {
            type: Map,
            of: String,
            default: {}
        },
    },
    { _id: false }
);

const PersonSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true
        },

        userId: {
            type: Number,
            required: true,
            index: true
        },

        displayName: {
            type: String,
            required: true,
            trim: true
        },

        tags: {
            type: [String],
            default: []
        },

        riskLevel: {
            type: String,
            enum: Object.values(RISK_LEVEL),
            required: true
        },

        metadata: {
            type: Map,
            of: String,
            default: {}
        },

        embeddings: {
            type: [FaceEmbeddingSchema],
            default: []
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false,
        collection: "vision_person",
        strict: true
    }
);

module.exports = {
    PersonModel: mongoose.model("VisionPerson", PersonSchema),
    RISK_LEVEL,
    FACE_SOURCE
};
