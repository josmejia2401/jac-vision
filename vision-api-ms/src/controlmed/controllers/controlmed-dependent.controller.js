const { dependentService } = require("../services/controlmed-dependent.service");
const {
    createDependentSchema,
    updateDependentSchema
} = require("../helpers/validators/controlmed-dependent.validator");

class DependentController {

    async getByUser(req, res) {

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const result = await dependentService.getByUser(
            req.auth.userId,
            page,
            limit
        );

        return res.json({ success: true, data: result });
    }

    async getById(req, res) {
        const dependent = await dependentService.getById(req.params.id);
        return res.json({ success: true, data: dependent });
    }

    async create(req, res) {
        req.body.userId = req.auth.userId;

        const { error, value } = createDependentSchema.validate(
            req.body,
            { abortEarly: false }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                details: error.details.map(d => d.message)
            });
        }

        const created = await dependentService.create(value);
        return res.status(201).json({ success: true, data: created });
    }

    async update(req, res) {
        req.body.userId = req.auth.userId;
        
        const { error, value } = updateDependentSchema.validate(
            req.body,
            { abortEarly: false }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                details: error.details.map(d => d.message)
            });
        }

        const updated = await dependentService.update(req.params.id, value);
        return res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await dependentService.delete(req.params.id);
        return res.json({ success: true, data: deleted });
    }
}

module.exports.dependentController = new DependentController();
