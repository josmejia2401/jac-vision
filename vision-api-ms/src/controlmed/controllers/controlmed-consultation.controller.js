const { consultationRecordService } = require("../services/controlmed-consultation-record.service");
const { createConsultationSchema, updateConsultationSchema } = require("../helpers/validators/controlmed-consultation.validator");

class ConsultationController {

    async getById(req, res) {
        const item = await consultationRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await consultationRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createConsultationSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }

        const created = await consultationRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateConsultationSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }

        const updated = await consultationRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await consultationRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.consultationController = new ConsultationController();
