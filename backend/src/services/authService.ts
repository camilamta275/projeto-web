import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from '../middlewares/errorMiddleware';
import { prisma } from '../config/prisma';

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'chave_secreta_super_segura';

const JWT_EXPIRATION: string =
  process.env.JWT_EXPIRATION || '24h';

// Blocklist em memória (em produção: Redis)
const tokenBlocklist = new Set<string>();

export const authService = {
  async register(nome: string, email: string, senha: string) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

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
          perfil: 'Cidadao',
          status: 'Ativo', // ✔ conforme schema.prisma
        },
      });

      await tx.cidadao.create({
        data: { id: created.id },
      });

      return created;
    });

    return usuario;
  },

  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    // ✔ CORRETO conforme ENUM do schema.prisma
    if (usuario.status !== 'Ativo') {
      throw new AppError(
        403,
        'Usuário inativo. Contate o administrador.'
      );
    }

    const isValidPassword = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!isValidPassword) {
      throw new AppError(401, 'Credenciais inválidas.');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
      },
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
      },
    });

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado.');
    }

    return usuario;
  },

  async addTokenToBlocklist(token: string) {
    try {
      const decoded = jwt.decode(token) as any;

      if (decoded && decoded.exp) {
        const ttl =
          decoded.exp - Math.floor(Date.now() / 1000);

        if (ttl > 0) {
          tokenBlocklist.add(token);

          setTimeout(() => {
            tokenBlocklist.delete(token);
          }, ttl * 1000);
        }
      }
    } catch (error) {
      console.error(
        'Erro ao adicionar token à blocklist:',
        error
      );
    }
  },

  isTokenBlocked(token: string): boolean {
    return tokenBlocklist.has(token);
  },
};