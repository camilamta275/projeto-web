import 'dotenv/config';
import { PrismaClient, perfil } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:BacoExu@localhost:5432/fiscalize?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET: string = process.env.JWT_SECRET || 'chave_secreta_super_segura';
const JWT_EXPIRATION: string = process.env.JWT_EXPIRATION || '24h';

export const authService = {
  async register(nome: string, email: string, senha: string) {
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      throw new Error('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        perfil: 'Cidad_o', // Role padrão atribuído automaticamente
      },
    });

    return usuario;
  },

  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new Error('Credenciais inválidas.');
    }

    // Verifica se o usuário está ativo
    if (usuario.status !== 'Ativo') {
      throw new Error('Credenciais inválidas.');
    }

    const isValidPassword = await bcrypt.compare(senha, usuario.senha);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRATION } as SignOptions
    );

    return { usuario, token };
  },
};