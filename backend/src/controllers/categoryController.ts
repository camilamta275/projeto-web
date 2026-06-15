import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService';

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.findAll();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params['id']);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
      }
      const category = await categoryService.findById(id);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },
};
