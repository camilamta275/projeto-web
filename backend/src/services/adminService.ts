import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import bcrypt from 'bcrypt';
import { perfil } from '@prisma/client';

export const adminService = {
  async activateUser(userId: string, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

    if (usuario.perfil === perfil.Admin) {
      throw new AppError(403, 'Não é permitido ativar outro admin.');
    }

    if (usuario.status === 'Ativo') {
      throw new AppError(409, 'Usuário já está ativo.');
    }

    return prisma.usuario.update({
      where: { id: userId },
      data: { status: 'Ativo' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });
  },

  async deactivateUser(userId: string, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

    if (usuario.perfil === perfil.Admin) {
      throw new AppError(403, 'Não é permitido desativar outro admin.');
    }

    if (usuario.id === adminId) {
      throw new AppError(403, 'Você não pode se desativar.');
    }

    if (usuario.status === 'Inativo') {
      throw new AppError(409, 'Usuário já está inativo.');
    }

    return prisma.usuario.update({
      where: { id: userId },
      data: { status: 'Inativo' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });
  },

  async listUsers(page: number, limit: number, role?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) where.perfil = role;
    if (status) where.status = status;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          status: true,
          criadoem: true,
        },
        orderBy: { criadoem: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    return {
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateUserRole(userId: string, role: perfil, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado.');
    }

    if (usuario.id === adminId) {
      throw new AppError(403, 'Você não pode alterar seu próprio perfil.');
    }

    if (usuario.perfil === role) {
      throw new AppError(409, 'Usuário já possui esse perfil.');
    }

    const atualizado = await prisma.usuario.update({
      where: { id: userId },
      data: { perfil: role },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    await prisma.usuario_audit.create({
      data: {
        usuarioid: userId,
        acao: 'ROLE_UPDATED',
        dadosantigos: { perfil: usuario.perfil },
        dadosnovos: { perfil: role },
      },
    });

    return atualizado;
  },

  async createUser(
    name: string,
    email: string,
    password: string,
    role: perfil,
    adminId: string,
  ) {
    const exists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (exists) {
      throw new AppError(409, 'E-mail já cadastrado.');
    }

    if (role === perfil.Admin) {
      throw new AppError(
        403,
        'Não é permitido criar usuários admin por este endpoint.'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        nome: name,
        email,
        senha: hashedPassword,
        perfil: role,
        status: 'Ativo',
        atualizadopor: adminId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    return user;
  },
};