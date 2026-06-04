import { Router } from 'express';
import { demandController } from '../controllers/demandController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.post('/', authenticate, requireRole(['Cidadao']), demandController.create);
router.get('/:id', authenticate, demandController.getById);
router.put('/:id', authenticate, requireRole(['Cidadao']), demandController.update);

export default router;
