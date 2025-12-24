const { Router } = require('express');
const { orderController } = require('../controllers/controlmed-order.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, orderController.create);
router.get('/:id', authMiddleware, orderController.getById);
router.get('/', orderController.getByDependent);
router.put('/:id', authMiddleware, orderController.update);
router.delete('/:id', authMiddleware, orderController.delete);

module.exports = router;
