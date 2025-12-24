const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    id: Number,
    fileName: String,
    mimeType: String,
    size: Number,
    url: String
}, { _id: false });

const MedicationSchema = new mongoose.Schema({
    name: String,
    presentation: String,
    dosage: String,
    frequency: String,
    duration: String,
    totalQuantity: String,
    notes: String
}, { _id: false });

const ExamTestSchema = new mongoose.Schema({
    name: String,
    result: String,
    unit: String,
    referenceRange: String,
    method: String,
    validationDate: Date
}, { _id: false });

const MedicalRecordSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true,
        index: true
    },
    dependentId: {
        type: Number,
        required: true,
        index: true
    },
    recordType: {
        type: String,
        enum: ['CONSULTATION', 'ORDER', 'EXAM', 'MEDICATION', 'DIAGNOSIS', 'CONTROL'],
        required: true
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    date: { type: Date, required: true },
    doctorName: { type: String, maxlength: 150 },
    specialty: { type: String, maxlength: 100 },
    healthCenter: { type: String, maxlength: 200 },

    // consultation-specific
    symptoms: [String],
    diagnosisSummary: { type: String, maxlength: 500 },

    // order / prescription
    prescription: {
        prescriptionType: { type: String, enum: ['ACUTE', 'CONTINUOUS'] },
        validityStart: Date,
        validityEnd: Date,
        diagnosisCode: { type: String, maxlength: 20 },
        diagnosisName: { type: String, maxlength: 200 },
        medications: [MedicationSchema]
    },

    // exam
    exams: {
        labName: String,
        validatedBy: String,
        tests: [ExamTestSchema]
    },

    // medication (active treatments)
    medications: [MedicationSchema],

    // diagnosis
    diagnosis: {
        code: { type: String, maxlength: 20 },
        name: { type: String, maxlength: 200 },
        severity: { type: String, enum: ['MILD', 'MODERATE', 'SEVERE'] },
        notes: { type: String, maxlength: 500 }
    },

    // control (follow-up)
    control: {
        controlReason: { type: String, maxlength: 300 },
        previousRecordId: Number,
        scheduledDate: Date,
        attendedDate: Date,
        status: { type: String, enum: ['SCHEDULED', 'DONE', 'CANCELLED'], default: 'SCHEDULED' },
        observations: { type: String, maxlength: 1000 }
    },

    attachments: [AttachmentSchema],
    notes: { type: String, maxlength: 1000 }

}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    strict: true,
    collection: "controlmed_medical_record"
});

module.exports.ControlMedMedicalRecordModel = mongoose.model('MedicalRecord', MedicalRecordSchema);
