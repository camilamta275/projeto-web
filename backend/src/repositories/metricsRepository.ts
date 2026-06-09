import { prisma } from '../config/prisma';

export const metricsRepository = {
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
