import { Router } from 'express';
import { demandController } from '../controllers/demandController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.post('/', authenticate, requireRole(['Cidadao']), demandController.create);

export default router;
