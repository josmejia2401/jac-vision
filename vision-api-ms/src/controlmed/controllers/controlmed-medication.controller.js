const { medicationRecordService } = require("../services/controlmed-medication-record.service");
const { createMedicationSchema, updateMedicationSchema } = require("../helpers/validators/controlmed-medication.validator");

class MedicationController {
    async getById(req, res) {
        const item = await medicationRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await medicationRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createMedicationSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const created = await medicationRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateMedicationSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const updated = await medicationRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await medicationRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.medicationController = new MedicationController();
