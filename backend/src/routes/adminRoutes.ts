import { Router } from 'express';
import { organController } from '../controllers/organController';
import { adminController } from '../controllers/adminController';
import { routingRuleController } from '../controllers/routingRuleController';
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

// GET /admin/organs/:id/categories
// Retorna as categorias vinculadas a um órgão específico (para popular o select no modal de regras)
router.get(
  '/organs/:id/categories',
  requireRole(['Admin']),
  organController.listarCategoriasPorOrgao
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

/* =========================
   ROUTING RULES (NOVO)
========================= */

// POST /admin/routing-rules
router.post(
  '/routing-rules',
  requireRole(['Admin']),
  adminController.criarRegraCompetencia
);

// GET /admin/routing-rules
router.get(
  '/routing-rules',
  requireRole(['Admin']),
  adminController.listarRegrasCompetencia
);

// PATCH /admin/routing-rules/:id
router.patch(
  '/routing-rules/:id',
  requireRole(['Admin']),
  adminController.editarRegraCompetencia
);

// DELETE /admin/routing-rules/:id
router.delete(
  '/routing-rules/:id',
  requireRole(['Admin']),
  adminController.deletarRegraCompetencia
);

/* =========================
   AUDIT LOGS
========================= */

// GET /admin/audit-logs
router.get(
  '/audit-logs',
  requireRole(['Admin']),
  adminController.listarAuditLogs
);

export default router;