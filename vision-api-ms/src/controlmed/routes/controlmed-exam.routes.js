const { Router } = require('express');
const { examController } = require('../controllers/controlmed-exam.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, examController.create);
router.get('/:id', authMiddleware, examController.getById);
router.get('/', examController.getByDependent);
router.put('/:id', authMiddleware, examController.update);
router.delete('/:id', authMiddleware, examController.delete);

module.exports = router;
