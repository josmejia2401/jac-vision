const express = require("express");
const { mediaController } = require("../controllers/vision-media.controller");
const { authMiddleware } = require("../helpers/middlewares/auth.middleware");

const router = express.Router();

router.get("/video/:filename", authMiddleware, mediaController.streaming.bind(mediaController.streaming));
router.get("/download/:filename", authMiddleware, mediaController.download.bind(mediaController.download));

module.exports = router;
