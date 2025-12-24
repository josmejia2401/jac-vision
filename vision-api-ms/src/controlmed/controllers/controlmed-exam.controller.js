const { examRecordService } = require("../services/controlmed-exam-record.service");
const { createExamSchema, updateExamSchema } = require("../helpers/validators/controlmed-exam.validator");

class ExamController {
    async getById(req, res) {
        const item = await examRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await examRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createExamSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const created = await examRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateExamSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const updated = await examRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await examRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.examController = new ExamController();
