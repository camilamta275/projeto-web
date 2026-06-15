import type { Request, Response } from 'express';
import { prisma } from './prisma';
import { isRedisAvailable } from './redis';
import { NODE_ENV } from './env';

export async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch {
    databaseStatus = 'disconnected';
  }

  const redisConnected = await isRedisAvailable();
  const redisStatus = redisConnected ? 'connected' : 'unavailable';

  const isHealthy = databaseStatus === 'connected';
  const status = isHealthy ? 'ok' : 'degraded';

  res.status(isHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: databaseStatus,
    redis: redisStatus,
  });
}
