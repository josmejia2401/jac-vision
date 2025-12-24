const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
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
        accessToken: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        appName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        audience: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        versionKey: false,
        strict: true,
        collection: "tokens"
    }
);

module.exports.TokenModel = mongoose.model("Token", TokenSchema, "tokens");
