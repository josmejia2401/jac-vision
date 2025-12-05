const { CameraModel } = require("../models/vision-camera.model");

class VisionCameraRepository {

    findById(id) {
        return CameraModel.findOne({ _id: id, status: { $ne: "DELETED" } });
    }

    findByUser(userId) {
        return CameraModel.find({ userId, status: { $ne: "DELETED" } });
    }

    create(data) {
        return CameraModel.create(data);
    }

    update(id, data) {
        return CameraModel.findOneAndUpdate(
            { _id: id, status: { $ne: "DELETED" } },
            data,
            { new: true }
        );
    }

    softDelete(id) {
        return CameraModel.findOneAndUpdate(
            { _id: id },
            { status: "DELETED" },
            { new: true }
        );
    }

    activate(id) {
        return CameraModel.findOneAndUpdate(
            { _id: id },
            { status: "ACTIVE" },
            { new: true }
        );
    }

    deactivate(id) {
        return CameraModel.findOneAndUpdate(
            { _id: id },
            { status: "INACTIVE" },
            { new: true }
        );
    }
}

module.exports.visionCameraRepository = new VisionCameraRepository();
