import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { demandService } from '../services/demandService';
import { AppError } from '../middlewares/errorMiddleware';

export const demandController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, category_id, location, latitude, longitude } = req.body;

      if (!title || !description || !category_id || !location) {
        throw new AppError(400, 'Campos obrigatórios: title, description, category_id, location');
      }

      const demand = await demandService.create({
        title: String(title),
        description: String(description),
        categoryId: Number(category_id),
        location: String(location),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
        userId: req.user!.id,
      });

      res.status(201).json(demand);
    } catch (error) {
      next(error);
    }
  },
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, categoria, regiao, page, limit } = req.query;

      const result = await demandService.list({
        userId: req.user!.id,
        perfil: req.user!.perfil,
        ...(status !== undefined && { status: String(status) }),
        ...(categoria !== undefined && { categoria: Number(categoria) }),
        ...(regiao !== undefined && { regiao: String(regiao) }),
        page: page ? Math.max(1, Number(page)) : 1,
        limit: limit ? Math.min(100, Math.max(1, Number(limit))) : 20,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const demand = await demandService.findById(id, req.user!.id, req.user!.perfil);
      res.status(200).json(demand);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { title, description, location, category_id, latitude, longitude } = req.body;

      const demand = await demandService.update({
        id,
        userId: req.user!.id,
        ...(title !== undefined && { title: String(title) }),
        ...(description !== undefined && { description: String(description) }),
        ...(location !== undefined && { location: String(location) }),
        ...(category_id !== undefined && { categoryId: Number(category_id) }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
      });

      res.status(200).json(demand);
    } catch (error) {
      next(error);
    }
  },
};
