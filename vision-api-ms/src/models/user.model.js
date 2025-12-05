const mongoose = require("mongoose");

const SecuritySchema = new mongoose.Schema(
    {
        loginAttempts: { type: Number, default: 0 },
        lockedUntil: { type: Date, default: null },
        lastLoginAt: { type: Date, default: null },
        roles: { type: [String], default: [] }
    },
    { _id: false }
);


const StatusSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true },
        name: { type: String, required: true }
    },
    { _id: false }
);


const VerificationFlowSchema = new mongoose.Schema(
    {
        type: { type: String, required: true },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        attempts: { type: Number, default: 0, min: 0 }
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        _id: { type: Number, required: true },

        firstName: { type: String, trim: true, required: true },
        lastName: { type: String, trim: true, required: true },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        phoneNumber: { type: String, trim: true },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3
        },

        password: { type: String, required: true },

        security: {
            type: SecuritySchema,
            default: () => ({})
        },

        status: {
            type: StatusSchema,
            required: true
        },

        previousStatus: {
            type: StatusSchema,
            default: null
        },

        verificationFlows: {
            type: [VerificationFlowSchema],
            default: []
        },

        createdAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        },
        versionKey: false,
        strict: true,
        collection: "users"
    }
);

module.exports.UserModel = mongoose.model("User", UserSchema, "users");
