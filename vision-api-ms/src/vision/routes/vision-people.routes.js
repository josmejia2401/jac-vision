const express = require("express");
const { visionPeopleController } = require("../controllers/vision-people.controller");
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = express.Router();

router.get("/:id", authMiddleware, (req, res) => visionPeopleController.getOne(req, res));
router.get("/user/:userId", authMiddleware, (req, res) => visionPeopleController.getByUser(req, res));
router.post("/", authMiddleware, (req, res) => visionPeopleController.create(req, res));
router.put("/:id", authMiddleware, (req, res) => visionPeopleController.update(req, res));
router.delete("/:id", authMiddleware, (req, res) => visionPeopleController.delete(req, res));

router.post("/:id/embeddings", authMiddleware, (req, res) => visionPeopleController.addEmbedding(req, res));
router.delete("/:id/embeddings/:embeddingId", authMiddleware, (req, res) => visionPeopleController.removeEmbedding(req, res));

module.exports = router;
