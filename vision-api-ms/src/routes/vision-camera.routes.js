const router = require("express").Router();
const { visionCameraController } = require("../controllers/vision-camera.controller");
const { authMiddleware } = require("../helpers/middlewares/auth.middleware");

// CRUD
router.post("/", authMiddleware, visionCameraController.create.bind(visionCameraController));
router.get("/:id", authMiddleware, visionCameraController.getById.bind(visionCameraController));
router.get("/user/:userId", authMiddleware, visionCameraController.getByUser.bind(visionCameraController));
router.put("/:id", authMiddleware, visionCameraController.update.bind(visionCameraController));
router.delete("/:id", authMiddleware, visionCameraController.delete.bind(visionCameraController));

// Estados
router.put("/:id/activate", authMiddleware, visionCameraController.activate.bind(visionCameraController));
router.put("/:id/deactivate", authMiddleware, visionCameraController.deactivate.bind(visionCameraController));

module.exports = router;
