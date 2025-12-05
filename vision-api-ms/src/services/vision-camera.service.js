const { visionCameraRepository } = require("../repositories/vision-camera.repository");
const { UniqueNumberUtil } = require("../helpers/utils/security/unique-number.util");
const BusinessException = require("../helpers/utils/errors/business-exception");

class VisionCameraService {

    async createCamera(data) {
        const id = UniqueNumberUtil.generateUniqueNumberDataBase();
        return visionCameraRepository.create({
            _id: id,
            userId: data.userId,
            name: data.name,
            rtspUrl: data.rtspUrl,
            snapshotUrl: data.snapshotUrl || null,
            location: data.location || null,
            metadata: data.metadata || {}
        });
    }

    async getCameraById(id) {
        const camera = await visionCameraRepository.findById(id);
        if (!camera) throw new BusinessException("Cámara no encontrada", 400);
        return camera;
    }

    getCamerasByUser(userId) {
        return visionCameraRepository.findByUser(userId);
    }

    updateCamera(id, data) {
        return visionCameraRepository.update(id, data);
    }

    deleteCamera(id) {
        return visionCameraRepository.softDelete(id);
    }

    activateCamera(id) {
        return visionCameraRepository.activate(id);
    }

    deactivateCamera(id) {
        return visionCameraRepository.deactivate(id);
    }
}

module.exports.visionCameraService = new VisionCameraService();
