const {
    createCameraSchema,
    updateCameraSchema,
    updateStatusSchema
} = require("../helpers/validators/vision-camera.validator");
const { visionCameraService } = require("../services/vision-camera.service");

class VisionCameraController {

    async create(req, res) {
        const { error, value } = createCameraSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: error.details.map(d => d.message)
            });
        }
        const camera = await visionCameraService.createCamera(value);
        return res.status(201).json({ success: true, data: camera });
    }

    async getById(req, res) {
        const camera = await visionCameraService.getCameraById(req.params.id);
        return res.json({ success: true, data: camera });
    }

    async getByUser(req, res) {
        const cameras = await visionCameraService.getCamerasByUser(req.params.userId);
        return res.json({ success: true, data: cameras });
    }

    async update(req, res) {
        const { error, value } = updateCameraSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: error.details.map(d => d.message)
            });
        }
        const updated = await visionCameraService.updateCamera(req.params.id, value);
        res.json({ success: true, data: updated });
    }

    async delete(req, res) {
        const deleted = await visionCameraService.deleteCamera(req.params.id);
        return res.json({ success: true, data: deleted });
    }

    async activate(req, res) {
        const { error } = updateStatusSchema.validate({ status: "ACTIVE" });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const cam = await visionCameraService.activateCamera(req.params.id);
        return res.json({ success: true, data: cam });
    }

    async deactivate(req, res) {
        const { error } = updateStatusSchema.validate({ status: "INACTIVE" });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const cam = await visionCameraService.deactivateCamera(req.params.id);
        return res.json({ success: true, data: cam });

    }
}

module.exports.visionCameraController = new VisionCameraController();
