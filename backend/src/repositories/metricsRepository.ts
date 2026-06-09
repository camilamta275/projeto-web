import { prisma } from '../config/prisma';

export const metricsRepository = {
  async averageResponseTime(where: { gestorid?: string }) {
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

  async demandsByCategory(where: { gestorid?: string }) {
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

  async countByScope(where: { gestorid?: string }) {
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
