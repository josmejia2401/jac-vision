const { RecordingModel } = require("../models/vision-recording.model");

class VisionRecordingRepository {

    findById(id) {
        return RecordingModel.findOne({ _id: id, status: { $ne: "DELETED" } });
    }

    findByUser(userId) {
        return RecordingModel.find({ userId, status: { $ne: "DELETED" } })
            .sort({ startedAt: -1 });
    }

    findByCamera(cameraId) {
        return RecordingModel.find({ cameraId, status: { $ne: "DELETED" } })
            .sort({ startedAt: -1 });
    }

    findByDateRange(cameraId, start, end) {
        return RecordingModel.find({
            cameraId,
            status: { $ne: "DELETED" },
            startedAt: { $gte: start },
            endedAt: { $lte: end }
        }).sort({ startedAt: -1 });
    }

    softDelete(id) {
        return RecordingModel.deleteOne({ _id: id });
    }

    create(data) {
        return RecordingModel.create(data);
    }

    update(id, data) {
        return RecordingModel.findOneAndUpdate(
            { _id: id, status: { $ne: "DELETED" } },
            data,
            { new: true }
        );
    }
}

module.exports.recordingRepository = new VisionRecordingRepository();
