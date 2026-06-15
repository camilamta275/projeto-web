import Redis from 'ioredis';

let client: Redis | null = null;
let connectionAttempted = false;

export function getRedisClient(): Redis | null {
  if (connectionAttempted) return client;
  connectionAttempted = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('[Redis] REDIS_URL not set — cache disabled');
    return null;
  }

  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  client.on('error', (err) => {
    console.warn('[Redis] Connection error:', err.message);
  });

  client.connect().catch((err) => {
    console.warn('[Redis] Initial connection failed:', err.message);
  });

  return client;
}

export async function isRedisAvailable(): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
