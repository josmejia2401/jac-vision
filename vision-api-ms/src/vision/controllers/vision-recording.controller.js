const { recordingService } = require("../services/vision-recording.service");

class VisionRecordingController {

    async getById(req, res, next) {
        try {
            const rec = await recordingService.getRecordingById(req.params.id);
            res.json({ success: true, data: rec });
        } catch (err) {
            next(err);
        }
    }

    async getByUser(req, res, next) {
        try {
            const list = await recordingService.getRecordingsByUser(req.params.userId);
            res.json({ success: true, data: list });
        } catch (err) {
            next(err);
        }
    }

    async getByCamera(req, res, next) {
        try {
            const list = await recordingService.getRecordingsByCamera(req.params.cameraId);
            res.json({ success: true, data: list });
        } catch (err) {
            next(err);
        }
    }

    async getByDate(req, res, next) {
        try {
            const { start, end } = req.query;

            if (!start || !end) {
                return res.status(400).json({
                    success: false,
                    message: "Debe enviar start y end en formato ISO"
                });
            }

            const list = await recordingService.getRecordingsByDate(
                req.params.cameraId,
                new Date(start),
                new Date(end)
            );

            res.json({ success: true, data: list });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const deleted = await recordingService.deleteRecording(req.params.id);
            res.json({ success: true, data: deleted });
        } catch (err) {
            next(err);
        }
    }
}

module.exports.recordingController = new VisionRecordingController();
