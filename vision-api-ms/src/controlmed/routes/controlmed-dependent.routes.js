const express = require("express");
const router = express.Router();
const { dependentController } = require("../controllers/controlmed-dependent.controller");
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

router.get("/", authMiddleware, dependentController.getByUser);
router.get("/:id", authMiddleware, dependentController.getById);
router.post("/", authMiddleware, dependentController.create);
router.put("/:id", authMiddleware, dependentController.update);
router.delete("/:id", authMiddleware, dependentController.delete);

module.exports = router;
