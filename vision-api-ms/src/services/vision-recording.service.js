const { recordingRepository } = require("../repositories/vision-recording.repository");

class VisionRecordingService {

    async getRecordingById(id) {
        const rec = await recordingRepository.findById(id);
        if (!rec) throw new Error("Grabación no encontrada");
        return rec;
    }

    getRecordingsByUser(userId) {
        return recordingRepository.findByUser(userId);
    }

    getRecordingsByCamera(cameraId) {
        return recordingRepository.findByCamera(cameraId);
    }

    getRecordingsByDate(cameraId, start, end) {
        return recordingRepository.findByDateRange(cameraId, start, end);
    }

    deleteRecording(id) {
        return recordingRepository.softDelete(id);
    }
}

module.exports.recordingService = new VisionRecordingService();
