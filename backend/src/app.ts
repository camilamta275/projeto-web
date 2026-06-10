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

export function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', authRoutes);
  app.use('/gestor', gestorRoutes);
  app.use('/users', userRoutes);
  app.use('/demands', demandRoutes);
  app.use('/categories', categoryRoutes);
  app.use('/admin', adminRoutes);
  app.use('/metrics', metricsRoutes);

  app.use(errorHandler);

  return app;
}

export default createApp();
