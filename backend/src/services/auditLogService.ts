import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const AuditActions = {
  ROLE_CHANGE: 'role_change',
  USER_ACTIVATED: 'user_activated',
  USER_DEACTIVATED: 'user_deactivated',
  ORGAN_CREATED: 'organ_created',
  ORGAN_EDITED: 'organ_edited',
  ROUTING_RULE_CREATED: 'routing_rule_created',
  ROUTING_RULE_EDITED: 'routing_rule_edited',
} as const;

interface FindAllFilters {
  action?: string | undefined;
  admin_id?: string | undefined;
  page: number;
  limit: number;
}

export const auditLogService = {
  async log(
    action: string,
    entity: string,
    entity_id: string,
    admin_id: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return prisma.audit_logs.create({
      data: {
        action,
        entity,
        entity_id,
        admin_id,
        ...(metadata !== undefined && { metadata }),
      },
    });
  },

  async findAll(filters: FindAllFilters) {
    const { action, admin_id, page, limit } = filters;
    const where: Prisma.audit_logsWhereInput = {};

    if (action) where.action = action;
    if (admin_id) where.admin_id = admin_id;

    const [data, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          admin: { select: { id: true, nome: true, email: true } },
        },
      }),
      prisma.audit_logs.count({ where }),
    ]);

    return { data, total, page, limit };
  },
};
