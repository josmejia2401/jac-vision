const router = require("express").Router();
const { recordingController } = require("../controllers/vision-recording.controller");

router.get("/:id", recordingController.getById.bind(recordingController));
router.get("/user/:userId", recordingController.getByUser.bind(recordingController));
router.get("/camera/:cameraId", recordingController.getByCamera.bind(recordingController));
router.get("/camera/:cameraId/by-date", recordingController.getByDate.bind(recordingController));
router.delete("/:id", recordingController.delete.bind(recordingController));

module.exports = router;
