import { Router } from 'express';
import { metricsController } from '../controllers/metricsController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(authenticate);
router.use(requireRole(['Gestor']));

router.get('/total-demands', metricsController.totalDemands);
router.get('/demands-by-category', metricsController.demandsByCategory);
router.get('/average-response-time', metricsController.averageResponseTime);

export default router;
