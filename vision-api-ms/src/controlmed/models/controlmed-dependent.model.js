const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxlength: 100,
            trim: true
        },
        dosage: {
            type: String,
            maxlength: 50,
            trim: true,
            default: null
        },
        frequency: {
            type: String,
            maxlength: 50,
            trim: true,
            default: null
        }
    },
    { _id: false }
);

const DependentSchema = new mongoose.Schema(
    {
        _id: { type: Number, required: true },

        userId: {
            type: Number,
            required: true,
            index: true,
        },

        firstName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 100,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 100,
            trim: true
        },

        documentType: {
            type: String,
            required: true,
            enum: ['CC', 'TI', 'RC', 'CE', 'PA', 'Otro']
        },

        documentNumber: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 20,
            match: /^[0-9A-Za-z-]+$/,
            index: true,
            trim: true
        },

        genderCode: {
            type: String,
            required: true,
            enum: ['MA', 'FE', 'OT', 'PNS']
        },

        birthDate: {
            type: Date,
            required: true
        },

        relationshipCode: {
            type: String,
            required: true,
            enum: [
                'SON',
                'DAUGHTER',
                'HUSBAND',
                'WIFE',
                'FATHER',
                'MOTHER',
                'BROTHER',
                'SISTER',
                'OTHER'
            ]
        },

        bloodType: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'],
            default: 'Desconocido'
        },

        // =========================
        // Contacto
        // =========================
        phone: {
            type: String,
            match: /^[0-9+()\s-]{7,20}$/,
            default: null,
            trim: true
        },

        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: null
        },

        address: {
            type: String,
            maxlength: 200,
            trim: true,
            default: null
        },

        // =========================
        // Salud y contexto médico
        // =========================
        allergies: {
            type: [String],
            default: []
        },

        chronicConditions: {
            type: [String],
            default: []
        },

        medications: {
            type: [MedicationSchema],
            default: []
        },

        eps: {
            type: String,
            maxlength: 100,
            trim: true,
            default: null
        },

        healthNotes: {
            type: String,
            maxlength: 500,
            trim: true,
            default: null
        },
    },
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt"
        },
        versionKey: false,
        strict: true,
        collection: "users"
    }
);

module.exports.DependentModel = mongoose.model("Dependent", DependentSchema, "controlmed_dependents");
