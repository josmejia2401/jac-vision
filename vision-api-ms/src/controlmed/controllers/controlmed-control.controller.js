const { controlRecordService } = require("../services/controlmed-control-record.service");
const { createControlSchema, updateControlSchema } = require("../helpers/validators/controlmed-control.validator");

class ControlController {
    async getById(req, res) {
        const item = await controlRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await controlRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createControlSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const created = await controlRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateControlSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const updated = await controlRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await controlRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.controlController = new ControlController();
