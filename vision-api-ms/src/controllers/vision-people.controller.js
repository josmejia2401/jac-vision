const { visionPeopleService } = require("../services/vision-people.service");
const { validatePerson, validateEmbedding } = require("../helpers/validators/vision-people.validator");

class VisionPeopleController {

    async getOne(req, res) {
        try {
            const person = await visionPeopleService.getOne(req.params.id);
            res.json({ success: true, data: person });
        } catch (err) {
            res.status(404).json({ success: false, message: err.message });
        }
    }

    async getByUser(req, res) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        const result = await visionPeopleService.getByUser(req.params.userId, page, limit);

        res.json({
            success: true,
            data: result.data,
            total: result.total,
            page,
            pages: Math.ceil(result.total / limit)
        });
    }

    async create(req, res) {
        const { error, value } = validatePerson(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }

        const newPerson = await visionPeopleService.createPerson(value);
        res.status(201).json({ success: true, data: newPerson });
    }

    async update(req, res) {
        const { error, value } = validatePerson(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }

        const updated = await visionPeopleService.updatePerson(req.params.id, value);
        res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await visionPeopleService.deletePerson(req.params.id);
        res.json({ success: true, data: deleted });
    }

    async addEmbedding(req, res) {
        const { error, value } = validateEmbedding(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                details: error.details.map(d => d.message)
            });
        }

        const updated = await visionPeopleService.addEmbedding(req.params.id, value);
        res.json({ success: true, data: updated });
    }

    async removeEmbedding(req, res) {
        const updated = await visionPeopleService.removeEmbedding(req.params.id, req.params.embeddingId);
        res.json({ success: true, data: updated });
    }
}

module.exports.visionPeopleController = new VisionPeopleController();
