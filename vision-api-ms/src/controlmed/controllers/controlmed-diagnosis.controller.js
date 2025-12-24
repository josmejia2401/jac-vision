const { diagnosisRecordService } = require("../services/controlmed-diagnosis-record.service");
const { createDiagnosisSchema, updateDiagnosisSchema } = require("../helpers/validators/controlmed-diagnosis.validator");

class DiagnosisController {
    async getById(req, res) {
        const item = await diagnosisRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await diagnosisRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createDiagnosisSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const created = await diagnosisRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateDiagnosisSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const updated = await diagnosisRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await diagnosisRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.diagnosisController = new DiagnosisController();
