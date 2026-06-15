import { getRedisClient } from '../config/redis';

export const METRICS_CACHE_TTL = 5 * 60;

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Graceful fallback — caller proceeds without cache
  }
}

export async function deleteCache(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch {
    // Graceful fallback
  }
}

export function metricsScopeKey(scope: { orgaoid?: string }): string {
  return scope.orgaoid ? `orgao:${scope.orgaoid}` : 'platform';
}

export function metricsCacheKeys(gestorId?: string | null): string[] {
  const keys = [
    'metrics:total:platform',
    'metrics:category:platform',
    'metrics:avg-response:platform',
  ];

  if (gestorId) {
    keys.push(
      `metrics:total:gestor:${gestorId}`,
      `metrics:category:gestor:${gestorId}`,
      `metrics:avg-response:gestor:${gestorId}`,
    );
  }

  return keys;
}

export async function invalidateMetricsCache(gestorId?: string | null): Promise<void> {
  const keys = metricsCacheKeys(gestorId);
  await Promise.all(keys.map(deleteCache));
}

export function snapshotRedisKey(date: string, scope: { orgaoid?: string }): string {
  return `metrics:snapshot:${date}:${metricsScopeKey(scope)}`;
}
