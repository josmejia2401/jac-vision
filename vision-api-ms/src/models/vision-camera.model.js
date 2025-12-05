const mongoose = require("mongoose");

const CameraSchema = new mongoose.Schema(
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
        name: {
            type: String,
            required: true,
            trim: true
        },
        rtspUrl: {
            type: String,
            required: true
        },
        location: {
            type: String,
            trim: true,
            default: null
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "DELETED"],
            default: "ACTIVE",
            index: true
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false,
        strict: true,
        collection: "vision_cameras"
    }
);

CameraSchema.index({ userId: 1, status: 1 });

module.exports.CameraModel = mongoose.model("VisionCamera", CameraSchema);
