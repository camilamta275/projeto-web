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
};
