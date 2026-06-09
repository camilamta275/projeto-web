import { metricsRepository } from '../repositories/metricsRepository';

export const metricsService = {
  async totalDemands(scope: { gestorid?: string }) {
    const where = scope.gestorid ? { gestorid: scope.gestorid } : {};
    return metricsRepository.countByScope(where);
  },
};
