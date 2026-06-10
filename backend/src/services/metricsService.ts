import { metricsRepository } from '../repositories/metricsRepository';
import { getCache, setCache, metricsScopeKey, METRICS_CACHE_TTL } from '../utils/cache';

async function computeAverageResponseTime(scope: { gestorid?: string }) {
  const where = scope.gestorid ? { gestorid: scope.gestorid } : {};
  const chamados = await metricsRepository.averageResponseTime(where);

  const diferencasHoras: number[] = [];

  for (const chamado of chamados) {
    const eventoResolucao = chamado.timeline_event.find(e => {
      const dados = e.dadosnovos as Record<string, unknown> | null;
      return dados?.status === 'Resolvido' || dados?.status === 'Fechado';
    });

    if (eventoResolucao) {
      const diffMs = eventoResolucao.timestamp.getTime() - chamado.criadoem.getTime();
      diferencasHoras.push(diffMs / (1000 * 60 * 60));
    }
  }

  const media =
    diferencasHoras.length === 0
      ? null
      : diferencasHoras.reduce((a, b) => a + b, 0) / diferencasHoras.length;

  return {
    total_demandas_consideradas: diferencasHoras.length,
    media_horas: media === null ? null : Math.round(media * 10) / 10,
  };
}

async function computeDemandsByCategory(scope: { gestorid?: string }) {
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
}

async function computeTotalDemands(scope: { gestorid?: string }) {
  const where = scope.gestorid ? { gestorid: scope.gestorid } : {};
  return metricsRepository.countByScope(where);
}

export const metricsService = {
  computeAverageResponseTime,
  computeDemandsByCategory,
  computeTotalDemands,

  async averageResponseTime(scope: { gestorid?: string }) {
    const cacheKey = `metrics:avg-response:${metricsScopeKey(scope)}`;
    const cached = await getCache<Awaited<ReturnType<typeof computeAverageResponseTime>>>(cacheKey);
    if (cached) return cached;

    const result = await computeAverageResponseTime(scope);
    await setCache(cacheKey, result, METRICS_CACHE_TTL);
    return result;
  },

  async demandsByCategory(scope: { gestorid?: string }) {
    const cacheKey = `metrics:category:${metricsScopeKey(scope)}`;
    const cached = await getCache<Awaited<ReturnType<typeof computeDemandsByCategory>>>(cacheKey);
    if (cached) return cached;

    const result = await computeDemandsByCategory(scope);
    await setCache(cacheKey, result, METRICS_CACHE_TTL);
    return result;
  },

  async totalDemands(scope: { gestorid?: string }) {
    const cacheKey = `metrics:total:${metricsScopeKey(scope)}`;
    const cached = await getCache<Awaited<ReturnType<typeof computeTotalDemands>>>(cacheKey);
    if (cached) return cached;

    const result = await computeTotalDemands(scope);
    await setCache(cacheKey, result, METRICS_CACHE_TTL);
    return result;
  },
};
