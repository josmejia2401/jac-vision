const express = require("express");
const { userController } = require("../controllers/user.controller");
const { authMiddleware } = require("../helpers/middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, userController.getPaginated);
router.get("/:id", authMiddleware, userController.getById);
router.put("/:id", authMiddleware, userController.update);
router.delete("/:id", authMiddleware, userController.delete);
router.put("/:id/password", authMiddleware, userController.updatePassword);
router.post("/", userController.create);

module.exports = router;
