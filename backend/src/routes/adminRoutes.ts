import { Router } from 'express';
import { organController } from '../controllers/organController';
import { adminController } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(authenticate);

/* =========================
   ORGANS (já existente)
========================= */

// GET /admin/organs
router.get(
  '/organs',
  requireRole(['Admin', 'Gestor']),
  organController.list
);

// POST /admin/organs
router.post(
  '/organs',
  requireRole(['Admin']),
  organController.cadastrarOrgao
);

// PUT /admin/organs/:id
router.put(
  '/organs/:id',
  requireRole(['Admin']),
  organController.editarOrgao
);

// PUT /admin/organs/:id/:status
router.put(
  '/organs/:id/:status',
  requireRole(['Admin']),
  organController.editarStatus
);

/* =========================
   USERS (NOVO - ADMIN)
========================= */

// GET /admin/users
router.get(
  '/users',
  requireRole(['Admin']),
  adminController.listarUsuarios
);

// PATCH /admin/users/:id/activate
router.patch(
  '/users/:id/activate',
  requireRole(['Admin']),
  adminController.ativarUsuario
);

// PATCH /admin/users/:id/deactivate
router.patch(
  '/users/:id/deactivate',
  requireRole(['Admin']),
  adminController.desativarUsuario
);

// PATCH /admin/users/:id/role
router.patch(
  '/users/:id/role',
  requireRole(['Admin']),
  adminController.alterarRole
);

// POST /admin/users
router.post(
  '/users',
  requireRole(['Admin']),
  adminController.criarUsuario
);

export default router;