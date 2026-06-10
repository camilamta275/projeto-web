import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

export default async function globalSetup() {
  config({ path: resolve(__dirname, '../../../.env.test') });
  process.env.NODE_ENV = 'test';

  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'pipe',
      cwd: resolve(__dirname, '../../..'),
      env: {
        ...process.env,
        PRISMA_MIGRATE_ADVISORY_LOCK_TIMEOUT: '60000',
      },
    });
  } catch {
    const status = execSync('npx prisma migrate status', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '../../..'),
      env: process.env,
    });

    if (!status.includes('Database schema is up to date')) {
      throw new Error(
        'Test database is not migrated. Stop the dev server and run: npx prisma migrate deploy',
      );
    }

    console.warn('[tests] migrate deploy skipped (advisory lock) — schema already up to date');
  }
}
