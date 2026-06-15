import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';
import { auditLogService } from '../services/auditLogService';

export const adminController = {
  async listarUsuarios(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const role =
        typeof req.query.role === 'string'
          ? req.query.role
          : undefined;

      const status =
        typeof req.query.status === 'string'
          ? req.query.status
          : undefined;

      const result = await adminService.listUsers(
        page,
        limit,
        role,
        status
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async ativarUsuario(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const adminId = (req as any).user.id;

      // ✔ FIX AQUI (FORÇA string)
      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          error: 'ID inválido',
        });
      }

      const usuario = await adminService.activateUser(
        id,
        adminId
      );

      return res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  async desativarUsuario(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const adminId = (req as any).user.id;

      // ✔ FIX AQUI (FORÇA string)
      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          error: 'ID inválido',
        });
      }

      const usuario = await adminService.deactivateUser(
        id,
        adminId
      );

      return res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  // ============================
  // 🔥 NOVO MÉTODO: ALTERAR ROLE
  // ============================
  async alterarRole(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const adminId = (req as any).user.id;

      const { role } = req.body;

      // validação de id
      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          error: 'ID inválido',
        });
      }

      // validação de role
      if (!role || !['Cidadao', 'Gestor'].includes(role)) {
        return res.status(400).json({
          error: "Role inválida. Use 'Cidadao' ou 'Gestor'.",
        });
      }

      const usuario = await adminService.updateUserRole(
        id,
        role,
        adminId
      );

      return res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  async listarAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const action =
        typeof req.query.action === 'string'
          ? req.query.action
          : undefined;

      const admin_id =
        typeof req.query.admin_id === 'string'
          ? req.query.admin_id
          : undefined;

      const result = await auditLogService.findAll({
        action,
        admin_id,
        page,
        limit,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async criarUsuario(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const adminId = (req as any).user.id;

      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, email, password, role',
        });
      }

      if (!['Cidadao', 'Gestor'].includes(role)) {
        return res.status(400).json({
          error: "Role inválida. Use 'Cidadao' ou 'Gestor'.",
        });
      }

      const usuario = await adminService.createUser(
        name,
        email,
        password,
        role,
        adminId
      );

      return res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  async criarRegraCompetencia(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { categoriaId, subcategoria, orgaoprincipalId, orgaosecundarioId, slaHoras, prioridade } = req.body;

      const regra = await adminService.createRoutingRule(
        categoriaId,
        subcategoria,
        orgaoprincipalId,
        orgaosecundarioId,
        slaHoras, // opcional - pode ser undefined
        prioridade
      );

      return res.status(201).json(regra);
    } catch (error) {
      next(error);
    }
  },

  async listarRegrasCompetencia(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;
      const organ_id = typeof req.query.organ_id === 'string' ? req.query.organ_id : undefined;
      const category_id = typeof req.query.category_id === 'string' ? Number(req.query.category_id) : undefined;

      const result = await adminService.listRoutingRules(page, limit, organ_id, category_id);

      // Mapeia para o shape esperado pelo MatrizPage
      const regras = result.regras.map((r: any) => ({
        id: r.id,
        categoria: r.categoria,                                                        // { id, nome }
        subcategoria: r.subcategoria,
        orgaoPrincipal: r.orgao_regra_competencia_orgaoprincipalidToorgao,             // { id, sigla, nome }
        orgaoSecundario: r.orgao_regra_competencia_orgaosecundarioidToorgao ?? null,   // { id, sigla, nome } | null
        sla: r.slahoras,
        prioridade: r.prioridade,
      }));

      return res.status(200).json({ regras, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },


  async editarRegraCompetencia(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
      }

      const {
        categoriaId,
        subcategoria,
        orgaoprincipalId,
        orgaosecundarioId,
        slaHoras,
        prioridade,
      } = req.body;

      const regra = await adminService.updateRoutingRule(id, {
        ...(categoriaId !== undefined && { categoriaId: Number(categoriaId) }),
        ...(subcategoria !== undefined && { subcategoria }),
        ...(orgaoprincipalId !== undefined && { orgaoprincipalId }),
        ...(orgaosecundarioId !== undefined && { orgaosecundarioId }),
        ...(slaHoras !== undefined && { slaHoras: Number(slaHoras) }),
        ...(prioridade !== undefined && { prioridade }),
      })

      // Mesmo shape do GET — front-end não precisa tratar diferente
      return res.status(200).json({
        id: regra.id,
        categoria: regra.categoria,
        subcategoria: regra.subcategoria,
        orgaoPrincipal: regra.orgao_regra_competencia_orgaoprincipalidToorgao,
        orgaoSecundario: regra.orgao_regra_competencia_orgaosecundarioidToorgao ?? null,
        sla: regra.slahoras,
        prioridade: regra.prioridade,
      });
    } catch (error) {
      next(error);
    }
  },

  async deletarRegraCompetencia(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          error: 'ID inválido.',
        });
      }

      await adminService.deleteRoutingRule(id);

      return res.status(200).json({
        success: true,
        message: 'Regra de competência deletada com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  },
};