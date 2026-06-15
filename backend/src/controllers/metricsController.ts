import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorMiddleware';
import { metricsService } from '../services/metricsService';
import { prisma } from '../config/prisma';

async function gestorScope(userId: string) {
  const gestor = await prisma.gestor.findUnique({ where: { id: userId }, select: { orgaoid: true } });
  return gestor ? { orgaoid: gestor.orgaoid } : {};
}

export const metricsController = {
  async averageResponseTime(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const perfil = req.user?.perfil;

      if (!userId || !perfil) throw new AppError(401, 'Usuário não autenticado.');

      const scope = perfil === 'Admin' ? {} : await gestorScope(userId);
      const result = await metricsService.averageResponseTime(scope);

      res.status(200).json({ escopo: perfil === 'Admin' ? 'plataforma' : 'gestor', ...result });
    } catch (error) {
      next(error);
    }
  },

  async demandsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const perfil = req.user?.perfil;

      if (!userId || !perfil) throw new AppError(401, 'Usuário não autenticado.');

      const scope = perfil === 'Admin' ? {} : await gestorScope(userId);
      const data = await metricsService.demandsByCategory(scope);

      res.status(200).json({ escopo: perfil === 'Admin' ? 'plataforma' : 'gestor', data });
    } catch (error) {
      next(error);
    }
  },

  async totalDemands(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const perfil = req.user?.perfil;

      if (!userId || !perfil) throw new AppError(401, 'Usuário não autenticado.');

      const scope = perfil === 'Admin' ? {} : await gestorScope(userId);
      const result = await metricsService.totalDemands(scope);

      res.status(200).json({ escopo: perfil === 'Admin' ? 'plataforma' : 'gestor', ...result });
    } catch (error) {
      next(error);
    }
  },
};
