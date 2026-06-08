import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/fiscalize?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Aqui criamos a instância ÚNICA com o adapter
const prisma = new PrismaClient({ adapter });

export { prisma };