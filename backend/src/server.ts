import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import 'dotenv/config';

const app = express();

// Middlewares globais
app.use(express.json());
app.use(cookieParser()); // ESSENCIAL PARA LER OS COOKIES DO JWT!

// Rotas
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});