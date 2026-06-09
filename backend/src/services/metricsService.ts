import { metricsRepository } from '../repositories/metricsRepository';

export const metricsService = {
  async demandsByCategory(scope: { gestorid?: string }) {
    const where = scope.gestorid ? { gestorid: scope.gestorid } : {};
    const { categorias, grupos } = await metricsRepository.demandsByCategory(where);

    const countMap = new Map(grupos.map(g => [g.categoriaid, g._count.id]));
    const total = grupos.reduce((sum, g) => sum + g._count.id, 0);

    return categorias.map(cat => {
      const count = countMap.get(cat.id) ?? 0;
      return {
        category: cat.nome,
        total: count,
        percentage: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      };
    });
  },

  async totalDemands(scope: { gestorid?: string }) {
    const where = scope.gestorid ? { gestorid: scope.gestorid } : {};
    return metricsRepository.countByScope(where);
  },
};
