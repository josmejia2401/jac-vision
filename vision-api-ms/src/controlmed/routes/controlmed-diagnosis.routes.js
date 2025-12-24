const { Router } = require('express');
const { diagnosisController } = require('../controllers/controlmed-diagnosis.controller');
const { authMiddleware } = require("../../helpers/middlewares/auth.middleware");

const router = Router();

router.post('/', authMiddleware, diagnosisController.create);
router.get('/:id', authMiddleware, diagnosisController.getById);
router.get('/', diagnosisController.getByDependent);
router.put('/:id', authMiddleware, diagnosisController.update);
router.delete('/:id', authMiddleware, diagnosisController.delete);

module.exports = router;
