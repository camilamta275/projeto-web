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
};
