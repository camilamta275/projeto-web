import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/adminService';

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
};