import cors from 'cors';
import { getAllowedOrigins, isProduction } from './env';

const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

function buildOriginAllowList(): string[] {
  const origins = new Set(getAllowedOrigins());

  if (!isProduction) {
    for (const origin of DEV_ORIGINS) {
      origins.add(origin);
    }

    const frontendUrl = process.env.FRONTEND_URL?.trim();
    if (frontendUrl) {
      origins.add(frontendUrl);
    }
  }

  return [...origins];
}

export function createCorsMiddleware() {
  const allowedOrigins = buildOriginAllowList();

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
