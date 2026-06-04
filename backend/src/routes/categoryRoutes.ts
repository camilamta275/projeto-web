import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, categoryController.list);
router.get('/:id', authenticate, categoryController.getById);

export default router;
