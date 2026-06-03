import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const userController = {
  async listarUsuarios(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const usuarios = await prisma.usuario.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          criadoem: true,
        },
        orderBy: { criadoem: 'desc' },
      });

      const totalUsuarios = await prisma.usuario.count();
      const totalPages = Math.ceil(totalUsuarios / limit);

      res.status(200).json({
        usuarios: usuarios.map(u => ({
          id: u.id,
          name: u.nome,
          email: u.email,
          role: u.perfil,
          created_at: u.criadoem,
        })),
        pagination: {
          page,
          limit,
          total: totalUsuarios,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
