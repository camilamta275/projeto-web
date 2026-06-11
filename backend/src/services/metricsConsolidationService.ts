import { prisma } from '../config/prisma';
import { isRedisAvailable } from '../config/redis';
import { metricsService } from './metricsService';
import { setCache, snapshotRedisKey } from '../utils/cache';

export interface MetricsSnapshotPayload {
  totalByStatus: {
    total: number;
    aberta: number;
    em_andamento: number;
    resolvida: number;
    encerrada: number;
  };
  byCategory: Array<{
    category: string;
    total: number;
    percentage: number;
  }>;
  averageResponseTime: {
    total_demandas_consideradas: number;
    media_horas: number | null;
  };
}

export interface ConsolidationResult {
  success: boolean;
  scopesProcessed: number;
  timestamp: string;
  error?: string;
}

async function computeSnapshot(scope: { orgaoid?: string }): Promise<MetricsSnapshotPayload> {
  const [totalByStatus, byCategory, averageResponseTime] = await Promise.all([
    metricsService.computeTotalDemands(scope),
    metricsService.computeDemandsByCategory(scope),
    metricsService.computeAverageResponseTime(scope),
  ]);

  return { totalByStatus, byCategory, averageResponseTime };
}

async function persistSnapshotToDb(payload: MetricsSnapshotPayload): Promise<void> {
  await prisma.metrics_snapshot.create({
    data: {
      porstatus: payload.totalByStatus as object,
      porcategoria: payload.byCategory as object,
      tempomedioresolucao: payload.averageResponseTime.media_horas ?? 0,
      jobstatus: 'success',
    },
  });
}

async function persistSnapshotToRedis(
  scope: { orgaoid?: string },
  payload: MetricsSnapshotPayload,
  dateKey: string,
): Promise<void> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) return;

  await setCache(snapshotRedisKey(dateKey, scope), payload, 24 * 60 * 60);
}

export async function runMetricsConsolidation(): Promise<ConsolidationResult> {
  const timestamp = new Date().toISOString();
  const dateKey = timestamp.slice(0, 10);

  try {
    const scopes: Array<{ scope: { orgaoid?: string } }> = [{ scope: {} }];

    const orgaos = await prisma.orgao.findMany({ select: { id: true } });
    for (const orgao of orgaos) {
      scopes.push({ scope: { orgaoid: orgao.id } });
    }

    const platformPayload = await computeSnapshot({});
    await persistSnapshotToDb(platformPayload);
    await persistSnapshotToRedis({}, platformPayload, dateKey);

    for (const { scope } of scopes.slice(1)) {
      const payload = await computeSnapshot(scope);
      await persistSnapshotToRedis(scope, payload, dateKey);
    }

    console.log(`[Cron] Metrics consolidation succeeded at ${timestamp} — ${scopes.length} scope(s)`);

    return { success: true, scopesProcessed: scopes.length, timestamp };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Cron] Metrics consolidation failed at ${timestamp}:`, message);

    try {
      await prisma.metrics_snapshot.create({
        data: {
          porstatus: {},
          porcategoria: [],
          tempomedioresolucao: 0,
          jobstatus: 'error',
          errormessage: message,
        },
      });
    } catch {
      // Do not crash if error logging to DB also fails
    }

    return { success: false, scopesProcessed: 0, timestamp, error: message };
  }
}
