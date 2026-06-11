import { prisma } from '../config/prisma';

type Scope = { orgaoid?: string };

export const metricsRepository = {
  async averageResponseTime(where: Scope) {
    return prisma.chamado.findMany({
      where: {
        ...where,
        status: { in: ['Resolvido', 'Fechado'] },
      },
      select: {
        criadoem: true,
        timeline_event: {
          where: { tipo: 'status' },
          orderBy: { timestamp: 'asc' },
          select: { timestamp: true, dadosnovos: true },
        },
      },
    });
  },

  async demandsByCategory(where: Scope) {
    const [categorias, grupos] = await Promise.all([
      prisma.categoria.findMany({ select: { id: true, nome: true } }),
      prisma.chamado.groupBy({
        by: ['categoriaid'],
        where,
        _count: { id: true },
      }),
    ]);

    return { categorias, grupos };
  },

  async countByScope(where: Scope) {
    const [total, aberta, em_andamento, resolvida, encerrada] = await Promise.all([
      prisma.chamado.count({ where }),
      prisma.chamado.count({ where: { ...where, status: 'Aberto' } }),
      prisma.chamado.count({ where: { ...where, status: 'Em_Andamento' } }),
      prisma.chamado.count({ where: { ...where, status: 'Resolvido' } }),
      prisma.chamado.count({ where: { ...where, status: 'Fechado' } }),
    ]);

    return { total, aberta, em_andamento, resolvida, encerrada };
  },
};
