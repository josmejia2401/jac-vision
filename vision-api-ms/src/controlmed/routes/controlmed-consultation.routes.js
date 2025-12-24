const { Router } = require('express');
const { consultationController } = require('../controllers/controlmed-consultation.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, consultationController.create);
router.get('/:id', authMiddleware, consultationController.getById);
router.get('/', consultationController.getByDependent);
router.put('/:id', authMiddleware, consultationController.update);
router.delete('/:id', authMiddleware, consultationController.delete);

module.exports = router;
