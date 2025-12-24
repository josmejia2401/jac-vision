const { orderRecordService } = require("../services/controlmed-order-record.service");
const { createOrderSchema, updateOrderSchema } = require("../helpers/validators/controlmed-order.validator");

class OrderController {
    async getById(req, res) {
        const item = await orderRecordService.findById(req.params.id);
        return res.json({ success: true, data: item });
    }

    async getByDependent(req, res) {
        const items = await orderRecordService.findByDependent(req.params.dependentId);
        return res.json({ success: true, data: items });
    }

    async create(req, res) {
        const { error, value } = createOrderSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const created = await orderRecordService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        const { error, value } = updateOrderSchema.validate(req.body, { abortEarly: false });

        if (error) return res.status(400).json({ success: false, message: "Datos inválidos", details: error.details.map(d => d.message) });

        const updated = await orderRecordService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await orderRecordService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.orderController = new OrderController();
