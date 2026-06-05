import { Router } from 'express';
import { organController } from '../controllers/organController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(authenticate);

// GET /admin/organs - Listar órgãos
router.get('/organs', requireRole(['Admin', 'Gestor']), organController.list);

// POST /admin/organs - Cadastrar novo órgão público
router.post('/organs', requireRole(['Admin']), organController.cadastrarOrgao);

// PUT /admin/organs/:id - Editar órgão (Admin apenas)
router.put('/organs/:id', requireRole(['Admin']), organController.editarOrgao);

// PUT /admin/organs/:id/:status - Editar status órgão (Admin apenas)
router.put('/organs/:id/:status', requireRole(['Admin']), organController.editarStatus);

export default router;
