const { Router } = require('express');
const { controlController } = require('../controllers/controlmed-control.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, controlController.create);
router.get('/:id', authMiddleware, controlController.getById);
router.get('/', controlController.getByDependent);
router.put('/:id', authMiddleware, controlController.update);
router.delete('/:id', authMiddleware, controlController.delete);

module.exports = router;
