import { Router } from 'express';
import { gestorController } from '../controllers/gestorController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Todas as rotas de gestor requerem autenticação e perfil Gestor ou Admin
router.use(authenticate);
router.use(requireRole(['Gestor']));

// Dashboard do gestor - estatísticas e resumo
router.get('/dashboard', gestorController.dashboard);

// Gestores do mesmo órgão
router.get('/equipe', gestorController.listarEquipe);

// Listar chamados do gestor
router.get('/chamados', gestorController.listarChamados);

// Detalhar um chamado específico
router.get('/chamados/:id', gestorController.detalharChamado);

// Aceitar / atribuir chamado
router.put('/chamados/:id/aceitar', gestorController.aceitarChamado);

// Transferir chamado para outro órgão
router.put('/chamados/:id/transferir', gestorController.transferirChamado);

// Atualizar status de um chamado
router.put('/chamados/:id/status', gestorController.atualizarStatusChamado);

export default router;
