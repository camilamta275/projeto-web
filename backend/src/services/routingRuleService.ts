import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import { auditLogService, AuditActions } from './auditLogService';

interface CreateRoutingRuleInput {
  category_id: number;
  organ_id: string;
  active?: boolean;
  adminId: string;
}

interface UpdateRoutingRuleInput {
  id: string;
  category_id?: number | undefined;
  organ_id?: string | undefined;
  active?: boolean | undefined;
  adminId: string;
}

export const routingRuleService = {
  async create(input: CreateRoutingRuleInput) {
    const { category_id, organ_id, active = true, adminId } = input;

    const categoria = await prisma.categoria.findUnique({ where: { id: category_id } });
    if (!categoria || !categoria.ativo) {
      throw new AppError(400, `Categoria inválida: categoria ${category_id} não encontrada ou inativa.`);
    }

    const orgao = await prisma.orgao.findUnique({ where: { id: organ_id } });
    if (!orgao) {
      throw new AppError(400, `Órgão inválido: órgão ${organ_id} não encontrado.`);
    }

    const rule = await prisma.routing_rules.create({
      data: { category_id, organ_id, active },
    });

    await auditLogService.log(
      AuditActions.ROUTING_RULE_CREATED,
      'routing_rule',
      rule.id,
      adminId,
      { category_id, organ_id, active },
    );

    return rule;
  },

  async update(input: UpdateRoutingRuleInput) {
    const { id, category_id, organ_id, active, adminId } = input;

    const existing = await prisma.routing_rules.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Regra de roteamento não encontrada.');
    }

    if (category_id !== undefined) {
      const categoria = await prisma.categoria.findUnique({ where: { id: category_id } });
      if (!categoria || !categoria.ativo) {
        throw new AppError(400, `Categoria inválida: categoria ${category_id} não encontrada ou inativa.`);
      }
    }

    if (organ_id !== undefined) {
      const orgao = await prisma.orgao.findUnique({ where: { id: organ_id } });
      if (!orgao) {
        throw new AppError(400, `Órgão inválido: órgão ${organ_id} não encontrado.`);
      }
    }

    const updated = await prisma.routing_rules.update({
      where: { id },
      data: {
        ...(category_id !== undefined && { category_id }),
        ...(organ_id !== undefined && { organ_id }),
        ...(active !== undefined && { active }),
      },
    });

    await auditLogService.log(
      AuditActions.ROUTING_RULE_EDITED,
      'routing_rule',
      updated.id,
      adminId,
      {
        before: { category_id: existing.category_id, organ_id: existing.organ_id, active: existing.active },
        after: { category_id: updated.category_id, organ_id: updated.organ_id, active: updated.active },
      },
    );

    return updated;
  },
};
