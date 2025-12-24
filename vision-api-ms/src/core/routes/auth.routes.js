const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = express.Router();

router.post("/login", authController.logIn);
router.post("/logout", authMiddleware, authController.logOut);

module.exports = router;
