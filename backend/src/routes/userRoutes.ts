import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(authenticate);

// Apenas Gestor e Admin podem acessar (requireRole lida com a hierarquia)
router.get('/', requireRole(['Gestor']), userController.listarUsuarios);

export default router;
