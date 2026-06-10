import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env.test') });
process.env.NODE_ENV = 'test';
delete process.env.REDIS_URL;
