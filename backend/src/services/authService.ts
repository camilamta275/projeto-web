import 'dotenv/config';
import { PrismaClient, perfil } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:BacoExu@localhost:5432/fiscalize?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura';

export const authService = {
  async register(nome: string, email: string, senha: string, tipoPerfil: perfil = 'Cidad_o') {
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
        perfil: tipoPerfil,
      },
    });

    return usuario;
  },

  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new Error('Credenciais inválidas.');
    }

    const isValidPassword = await bcrypt.compare(senha, usuario.senha);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign({ usuarioId: usuario.id, perfil: usuario.perfil }, JWT_SECRET, {
      expiresIn: '1d',
        });

        return { usuario, token };
  },
};