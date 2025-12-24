const { Router } = require('express');
const { medicationController } = require('../controllers/controlmed-medication.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, medicationController.create);
router.get('/:id', authMiddleware, medicationController.getById);
router.get('/', medicationController.getByDependent);
router.put('/:id', authMiddleware, medicationController.update);
router.delete('/:id', authMiddleware, medicationController.delete);

module.exports = router;
