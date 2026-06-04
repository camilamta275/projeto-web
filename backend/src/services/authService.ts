import 'dotenv/config';
import { perfil } from '@prisma/client'; // Removemos o PrismaClient daqui
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from '../middlewares/errorMiddleware';

// 1. Importa a instância centralizada!
import { prisma } from '../config/prisma'; 

const JWT_SECRET: string = process.env.JWT_SECRET || 'chave_secreta_super_segura';
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '24h';

// Blocklist em memória (em produção, usar Redis)
const tokenBlocklist = new Set<string>();

export const authService = {
  async register(nome: string, email: string, senha: string) {
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      throw new AppError(409, 'E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const usuario = await prisma.$transaction(async (tx) => {
      const created = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: hashedPassword,
          perfil: 'Cidad_o',
        },
      });
      await tx.cidadao.create({ data: { id: created.id } });
      return created;
    });

    return usuario;
  },

  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    // Verifica se o usuário está ativo
    if (usuario.status !== 'Ativo') {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    const isValidPassword = await bcrypt.compare(senha, usuario.senha);
    if (!isValidPassword) {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRATION } as SignOptions
    );

    return { usuario, token };
  },

  async getUserById(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
        // Explicitamente NÃO incluindo 'senha'
      },
    });

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado.');
    }

    return usuario;
  },

  async addTokenToBlocklist(token: string) {
    try {
      // Decodifica o token para obter a expiração
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        // Calcula TTL (tempo em segundos até expiração)
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          tokenBlocklist.add(token);
          // Limpa a blocklist após expiração do token
          setTimeout(() => tokenBlocklist.delete(token), ttl * 1000);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar token à blocklist:', error);
    }
  },

  isTokenBlocked(token: string): boolean {
    return tokenBlocklist.has(token);
  },
};