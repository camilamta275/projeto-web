import { Request, Response, NextFunction } from 'express';
import { routingRuleService } from '../services/routingRuleService';

export const routingRuleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { category_id, organ_id, active } = req.body;

      if (!category_id || !organ_id) {
        return res.status(400).json({
          error: 'Campos obrigatórios: category_id, organ_id',
        });
      }

      const rule = await routingRuleService.create({
        category_id: Number(category_id),
        organ_id,
        active,
        adminId,
      });

      return res.status(201).json(rule);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { category_id, organ_id, active } = req.body;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const updateInput: Parameters<typeof routingRuleService.update>[0] = {
        id,
        adminId,
      };

      if (category_id !== undefined) updateInput.category_id = Number(category_id);
      if (organ_id !== undefined) updateInput.organ_id = organ_id;
      if (active !== undefined) updateInput.active = active;

      const rule = await routingRuleService.update(updateInput);

      return res.status(200).json(rule);
    } catch (error) {
      next(error);
    }
  },
};
