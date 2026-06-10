import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import gestorRoutes from './routes/gestorRoutes';
import userRoutes from './routes/userRoutes';
import demandRoutes from './routes/demandRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import metricsRoutes from './routes/metricsRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { registerCronJobs } from './config/cron';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // ESSENCIAL PARA LER OS COOKIES DO JWT!

// Health check (público — use para verificar se o servidor está no ar)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/gestor', gestorRoutes);
app.use('/users', userRoutes);
app.use('/demands', demandRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/metrics', metricsRoutes);

// Middleware de tratamento de erros (DEVE SER O ÚLTIMO)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  registerCronJobs();
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nERRO: a porta ${PORT} já está em uso.`);
    console.error('Encerre o processo anterior e tente novamente.');
    console.error(`PowerShell: Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  }
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
