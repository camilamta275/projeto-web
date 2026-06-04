import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import gestorRoutes from './routes/gestorRoutes';
import userRoutes from './routes/userRoutes';
import demandRoutes from './routes/demandRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
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

// Rotas
app.use('/auth', authRoutes);
app.use('/gestor', gestorRoutes);
app.use('/users', userRoutes);
app.use('/demands', demandRoutes);

// Middleware de tratamento de erros (DEVE SER O ÚLTIMO)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
