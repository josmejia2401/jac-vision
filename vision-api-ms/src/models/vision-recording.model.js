const mongoose = require("mongoose");

const RecordingSchema = new mongoose.Schema(
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

        cameraId: {
            type: Number,
            required: true,
            index: true
        },

        filePath: {
            type: String,
            required: true, // Ruta local o S3
            trim: true
        },

        contentType: {
            type: String,
            required: true,
            trim: true
        },

        fileSize: {
            type: Number,
            default: 0 // bytes
        },

        durationMs: {
            type: Number,
            default: 0
        },

        startedAt: {
            type: Date,
            required: true
        },

        endedAt: {
            type: Date,
            required: true
        },

        movementScore: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["READY", "PROCESSING", "FAILED", "DELETED"],
            default: "READY",
            index: true
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false,
        strict: true,
        collection: "vision_recordings"
    }
);

module.exports.RecordingModel = mongoose.model("VisionRecording", RecordingSchema);
