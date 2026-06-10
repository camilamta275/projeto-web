import { cleanupTestData, seedTestData } from '../helpers/seedTestData';
import { runMetricsConsolidation } from '../../services/metricsConsolidationService';
import { metricsService } from '../../services/metricsService';
import { prisma } from '../../config/prisma';

describe('Metrics consolidation service', () => {
  beforeAll(async () => {
    await seedTestData();
  });

  beforeEach(async () => {
    await cleanupTestData();
    await prisma.metrics_snapshot.deleteMany({});
    jest.restoreAllMocks();
  });

  it('persists snapshot when called directly', async () => {
    const result = await runMetricsConsolidation();

    expect(result.success).toBe(true);
    expect(result.scopesProcessed).toBeGreaterThanOrEqual(1);

    const snapshot = await prisma.metrics_snapshot.findFirst({
      where: { jobstatus: 'success' },
      orderBy: { criadoem: 'desc' },
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.porstatus).toBeDefined();
    expect(snapshot?.porcategoria).toBeDefined();
    expect(snapshot?.tempomedioresolucao).toBeDefined();
  });

  it('snapshot contains totals by status, by category, and average resolution time', async () => {
    await runMetricsConsolidation();

    const snapshot = await prisma.metrics_snapshot.findFirst({
      where: { jobstatus: 'success' },
      orderBy: { criadoem: 'desc' },
    });

    const porstatus = snapshot?.porstatus as Record<string, number>;
    const porcategoria = snapshot?.porcategoria as Array<{ category: string; total: number }>;

    expect(porstatus).toMatchObject({
      total: expect.any(Number),
      aberta: expect.any(Number),
      em_andamento: expect.any(Number),
      resolvida: expect.any(Number),
      encerrada: expect.any(Number),
    });
    expect(Array.isArray(porcategoria)).toBe(true);
    expect(snapshot?.tempomedioresolucao).not.toBeNull();
  });

  it('catches failure and logs error snapshot without throwing', async () => {
    jest
      .spyOn(metricsService, 'computeTotalDemands')
      .mockRejectedValueOnce(new Error('Simulated consolidation failure'));

    const result = await runMetricsConsolidation();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Simulated consolidation failure/);

    const errorSnapshot = await prisma.metrics_snapshot.findFirst({
      where: { jobstatus: 'error' },
      orderBy: { criadoem: 'desc' },
    });

    expect(errorSnapshot).not.toBeNull();
    expect(errorSnapshot?.errormessage).toMatch(/Simulated consolidation failure/);
  });
});
